/**
 * DishDiary — Web Storage Utility Module
 * 
 * Provides a clean API for localStorage and sessionStorage with:
 *  - JSON serialization/deserialization
 *  - Namespaced keys to avoid collisions
 *  - TTL (time-to-live) support for expiring data
 *  - App-specific helpers (user session, favorites, drafts, etc.)
 */

const StorageUtil = (function () {
    'use strict';

    const NAMESPACE = 'dishdiary_';

    // ─── Low-Level Helpers ────────────────────────────────────

    /**
     * Build a namespaced key.
     * @param {string} key
     * @returns {string}
     */
    function _key(key) {
        return NAMESPACE + key;
    }

    /**
     * Safely get a value from a storage backend.
     * Returns null if the key doesn't exist or is expired.
     * @param {Storage} storage - localStorage or sessionStorage
     * @param {string} key
     * @returns {*}
     */
    function _get(storage, key) {
        try {
            const raw = storage.getItem(_key(key));
            if (raw === null) return null;

            const envelope = JSON.parse(raw);

            // Check TTL expiry
            if (envelope._ttl && Date.now() > envelope._ttl) {
                storage.removeItem(_key(key));
                return null;
            }

            return envelope.value;
        } catch (e) {
            console.warn('[StorageUtil] Error reading key "' + key + '":', e);
            return null;
        }
    }

    /**
     * Safely set a value in a storage backend.
     * @param {Storage} storage - localStorage or sessionStorage
     * @param {string} key
     * @param {*} value - Will be JSON-serialized
     * @param {number} [ttlMs] - Optional time-to-live in milliseconds
     */
    function _set(storage, key, value, ttlMs) {
        try {
            const envelope = { value: value };
            if (ttlMs) {
                envelope._ttl = Date.now() + ttlMs;
            }
            storage.setItem(_key(key), JSON.stringify(envelope));
        } catch (e) {
            console.warn('[StorageUtil] Error writing key "' + key + '":', e);
        }
    }

    /**
     * Remove a key from a storage backend.
     * @param {Storage} storage
     * @param {string} key
     */
    function _remove(storage, key) {
        storage.removeItem(_key(key));
    }

    /**
     * Clear all namespaced keys from a storage backend.
     * @param {Storage} storage
     */
    function _clearNamespaced(storage) {
        const keysToRemove = [];
        for (let i = 0; i < storage.length; i++) {
            const k = storage.key(i);
            if (k && k.startsWith(NAMESPACE)) {
                keysToRemove.push(k);
            }
        }
        keysToRemove.forEach(function (k) { storage.removeItem(k); });
    }


    // ─── Public: Generic Local Storage ────────────────────────

    const local = {
        get: function (key) { return _get(localStorage, key); },
        set: function (key, value, ttlMs) { _set(localStorage, key, value, ttlMs); },
        remove: function (key) { _remove(localStorage, key); },
        clear: function () { _clearNamespaced(localStorage); }
    };


    // ─── Public: Generic Session Storage ──────────────────────

    const session = {
        get: function (key) { return _get(sessionStorage, key); },
        set: function (key, value) { _set(sessionStorage, key, value); },
        remove: function (key) { _remove(sessionStorage, key); },
        clear: function () { _clearNamespaced(sessionStorage); }
    };


    // ─── App-Specific: User Session ───────────────────────────

    const user = {
        /**
         * Log in a user. Stores user data in sessionStorage.
         * If `remember` is true, also persists to localStorage.
         * @param {Object} userData - { id, name, email, avatar, ... }
         * @param {boolean} remember - Persist across browser sessions
         */
        login: function (userData, remember) {
            session.set('currentUser', userData);
            if (remember) {
                local.set('rememberedUser', userData);
            }
        },

        /**
         * Get the currently logged-in user.
         * Falls back to remembered user from localStorage.
         * @returns {Object|null}
         */
        getCurrent: function () {
            return session.get('currentUser') || local.get('rememberedUser');
        },

        /**
         * Log out the current user.
         * Clears session and remembered user data.
         */
        logout: function () {
            session.remove('currentUser');
            local.remove('rememberedUser');
        },

        /**
         * Check if a user is logged in.
         * @returns {boolean}
         */
        isLoggedIn: function () {
            return this.getCurrent() !== null;
        }
    };


    // ─── App-Specific: Theme Preference ───────────────────────

    const theme = {
        /**
         * Save the selected theme.
         * @param {'light'|'dark'} themeName
         */
        set: function (themeName) {
            local.set('theme', themeName);
        },

        /**
         * Get the saved theme. Defaults to 'light'.
         * @returns {'light'|'dark'}
         */
        get: function () {
            return local.get('theme') || 'light';
        },

        /**
         * Apply the saved theme to the document.
         */
        apply: function () {
            var current = this.get();
            document.documentElement.setAttribute('data-bs-theme', current);
            document.documentElement.className = current;
        }
    };


    // ─── App-Specific: Favorites ──────────────────────────────

    const favorites = {
        _getAll: function () {
            return local.get('favorites') || [];
        },

        /**
         * Toggle a dish as favorite. Returns the new favorited state.
         * @param {number|string} dishId
         * @returns {boolean} - true if now favorited, false if removed
         */
        toggle: function (dishId) {
            var list = this._getAll();
            var id = String(dishId);
            var index = list.indexOf(id);
            if (index === -1) {
                list.push(id);
            } else {
                list.splice(index, 1);
            }
            local.set('favorites', list);
            return index === -1; // returns true if it was added
        },

        /**
         * Check if a dish is favorited.
         * @param {number|string} dishId
         * @returns {boolean}
         */
        isFavorited: function (dishId) {
            return this._getAll().indexOf(String(dishId)) !== -1;
        },

        /**
         * Get all favorited dish IDs.
         * @returns {string[]}
         */
        getAll: function () {
            return this._getAll();
        },

        /**
         * Get the total count of favorites.
         * @returns {number}
         */
        count: function () {
            return this._getAll().length;
        }
    };


    // ─── App-Specific: Recently Viewed Dishes ─────────────────

    var MAX_RECENT = 10;

    const recentlyViewed = {
        /**
         * Add a dish to the recently viewed list.
         * @param {Object} dish - { id, title, image, rating }
         */
        add: function (dish) {
            var list = local.get('recentlyViewed') || [];
            // Remove if already in list (move to front)
            list = list.filter(function (d) { return String(d.id) !== String(dish.id); });
            // Add to front
            list.unshift({
                id: dish.id,
                title: dish.title,
                image: dish.image,
                rating: dish.rating,
                viewedAt: new Date().toISOString()
            });
            // Trim to max
            if (list.length > MAX_RECENT) {
                list = list.slice(0, MAX_RECENT);
            }
            local.set('recentlyViewed', list);
        },

        /**
         * Get all recently viewed dishes.
         * @returns {Object[]}
         */
        getAll: function () {
            return local.get('recentlyViewed') || [];
        },

        /**
         * Clear the recently viewed list.
         */
        clear: function () {
            local.remove('recentlyViewed');
        }
    };


    // ─── App-Specific: Meal Log Draft ─────────────────────────

    const draft = {
        /**
         * Save a meal log form draft to localStorage.
         * @param {Object} formData - { dishName, rating, date, review }
         */
        save: function (formData) {
            local.set('mealLogDraft', formData);
        },

        /**
         * Load a saved meal log draft.
         * @returns {Object|null}
         */
        load: function () {
            return local.get('mealLogDraft');
        },

        /**
         * Clear the saved draft (e.g., after publishing).
         */
        clear: function () {
            local.remove('mealLogDraft');
        },

        /**
         * Check if a draft exists.
         * @returns {boolean}
         */
        exists: function () {
            return this.load() !== null;
        }
    };


    // ─── App-Specific: Active Category ────────────────────────

    const category = {
        /**
         * Save the selected category filter.
         * @param {string} categoryName
         */
        setActive: function (categoryName) {
            session.set('activeCategory', categoryName);
        },

        /**
         * Get the active category filter.
         * @returns {string|null}
         */
        getActive: function () {
            return session.get('activeCategory');
        }
    };


    // ─── App-Specific: Search History ─────────────────────────

    var MAX_SEARCH_HISTORY = 20;

    const searchHistory = {
        /**
         * Add a search term to the history.
         * @param {string} term
         */
        add: function (term) {
            if (!term || !term.trim()) return;
            var list = local.get('searchHistory') || [];
            var normalized = term.trim().toLowerCase();
            list = list.filter(function (t) { return t !== normalized; });
            list.unshift(normalized);
            if (list.length > MAX_SEARCH_HISTORY) {
                list = list.slice(0, MAX_SEARCH_HISTORY);
            }
            local.set('searchHistory', list);
        },

        /**
         * Get all search history entries.
         * @returns {string[]}
         */
        getAll: function () {
            return local.get('searchHistory') || [];
        },

        /**
         * Clear search history.
         */
        clear: function () {
            local.remove('searchHistory');
        }
    };


    // ─── Public API ───────────────────────────────────────────

    return {
        local: local,
        session: session,
        user: user,
        theme: theme,
        favorites: favorites,
        recentlyViewed: recentlyViewed,
        draft: draft,
        category: category,
        searchHistory: searchHistory
    };

})();
