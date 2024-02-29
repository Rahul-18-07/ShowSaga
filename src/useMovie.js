import { useEffect, useState } from "react";
const apiKey = 'apikey=5308900f'
export function useMovie(query) {

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [movies, setMovies] = useState([]);
    useEffect(() => {
        const controller = new AbortController();
        async function fetchMovies() {

            try {
                setIsLoading(true);
                setError("");
                const res = await fetch(`http://www.omdbapi.com/?${apiKey}&s=${query}`, { signal: controller.signal })
                if (!res.ok) {
                    setError("Something went wrong")
                    throw new Error('Something went wrong')
                }
                const data = await res.json();
                if (data.Response === "False") {
                    setError("Movie not found")
                    throw new Error("Movie Not Found")

                }
                setMovies(data.Search)
                setIsLoading(false);

            }
            catch (err) {
                console.log(err);

            } finally {
                setIsLoading(false);
            }
        }
        if (query.length < 3) {
            setMovies([]);
            setError("");
            return
        }
        fetchMovies()
        return function () {
            controller.abort();
        }
    }, [query]);

    return {
        movies, isLoading, error
    }
}