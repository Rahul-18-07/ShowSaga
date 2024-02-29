import { useState, useEffect } from "react";

export function useLocalStorageState(intialState, key) {
    const [value, setValue] = useState(function () {
        let watchedStorage = localStorage.getItem(key);
        return watchedStorage ? JSON.parse(watchedStorage) : intialState;
    });
    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [value, key]);

    return [value, setValue];
}