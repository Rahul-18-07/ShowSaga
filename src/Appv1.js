import { useEffect, useRef, useState } from "react";
import StarRating from "./components/star"
import { useMovie } from "./useMovie";
import { useLocalStorageState } from "./useLocalStorageState"
import { useKey } from "./useKey";

function Navbar({ children }) {


    return <nav className="nav-bar">
        <Logo />
        {children}
    </nav>
}
function Search({ query, setQuery }) {
    const inputElement = useRef(null);

    useKey('Enter', function () {
        if (document.activeElement === inputElement.current)
            return;

        setQuery("")
        inputElement.current?.focus();
    }
    )

    return <input
        className="search"
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        ref={inputElement}
    />
}
function Logo() {
    return <div className="logo">
        <span role="img">🍿</span>
        <h1>usePopcorn</h1>
    </div>
}
function NumResults({ movies }) {
    return <p className="num-results">
        Found <strong>{movies.length}</strong> results
    </p>

}

function Box({ children }) {
    const [isOpen1, setIsOpen1] = useState(true);


    return <div className="box">
        <button
            className="btn-toggle"
            onClick={() => setIsOpen1((open) => !open)}
        >
            {isOpen1 ? "–" : "+"}
        </button>
        {isOpen1 && (
            children

        )}
    </div>
}

// }
function MovieList({ movies, handleSelectMovie }) {

    return <ul className="list list-movies">
        {movies?.map((movie) => (
            <Movie movie={movie}
                key={movie.imdbID}
                id={movie.imdbID}
                handleSelectMovie={handleSelectMovie}
            />
        ))}
    </ul>
}
function Movie({ id, movie, handleSelectMovie }) {

    return <li onClick={() => handleSelectMovie(id)}>
        <img src={movie.Poster} alt={`${movie.Title} poster`} />
        <h3>{movie.Title}</h3>
        <div>
            <p>
                <span>🗓</span>
                <span>{movie.Year}</span>
            </p>
        </div>
    </li>
}
const apiKey = 'apikey=5308900f'

function MovieDetails({ watched, selectedId, onCloseMovie, onAddWatched }) {
    const [isLoading, setIsLoading] = useState(false)
    const [movie, setMovie] = useState({});
    const [userRating, setUserRating] = useState(0);

    const isWatched = watched.map(movie => movie.imdbId).includes(selectedId);
    const WatchedUserRating = watched.find(movie => movie.imdbId === selectedId)?.userRating;
    useKey("Escape", onCloseMovie)

    const { Title: title,
        Year: year,
        Poster: poster,
        Runtime: runtime,
        Actors: actors,
        imdbRating,
        Plot: plot,
        Released: released,
        Director: director,
        Genre: genre,

    } = movie;
    function handleAdd() {

        const newWatchMovie = {
            imdbId: selectedId,
            title,
            year,
            poster,
            imdbRating: Number(imdbRating),
            runtime: Number(runtime.split(" ").at(0)),
            userRating
        }
        onAddWatched(newWatchMovie)
        onCloseMovie();
    }
    useEffect(() => {
        setIsLoading(true)
        async function getMovieData() {
            const res = await fetch(`http://www.omdbapi.com/?${apiKey}&i=${selectedId}`)
            const data = await res.json();
            setMovie(data)
            setIsLoading(false)
        }
        getMovieData();
    }, [selectedId])
    useEffect(() => {
        if (title)
            document.title = `Movie | ${title}`
        return function () {
            document.title = "UsePopCorn";
        }
    }, [title]);

    return <div className="details">
        {isLoading ? <Loader /> : <>
            <header>
                <button className="btn-back" onClick={onCloseMovie}>&larr;</button>
                <img src={poster} alt={title} />
                <div className="details-overview">
                    <h2>{title}</h2>
                    <p>
                        {released} &bull; {runtime}
                    </p>
                    <p>{genre}</p>
                    <p><span>⭐</span>
                        {imdbRating} IMdb Rating</p>
                </div>
            </header>
            <section>
                <div className="rating">

                    {!isWatched ? <>
                        <StarRating maxRating={10} size={24} onSetRating={setUserRating} />
                        {userRating > 0 && <button className='btn-add' onClick={handleAdd}>+ Add to list</button>
                        }
                    </> : <>
                        <p>You have rated this Movie {WatchedUserRating} ⭐</p>
                    </>}


                </div>
                <p>
                    <em>{plot}</em>
                </p>
                <p>Starring {actors}</p>
                <p>Directed By {director}</p>
            </section>
        </>
        }
    </div>;
}

function WatchedSummary({ watched }) {
    const avgImdbRating = parseFloat(average(watched.map((movie) => movie.imdbRating))).toFixed(2);
    const avgUserRating = parseFloat(average(watched.map((movie) => movie.userRating))).toFixed(2);
    const avgRuntime = parseFloat(average(watched.map((movie) => movie.runtime))).toFixed(0);

    return <div className="summary">
        <h2>Movies you watched</h2>
        <div>
            <p>
                <span>#️⃣</span>
                <span>{watched.length} movies</span>
            </p>
            <p>
                <span>⭐️</span>
                <span>{avgImdbRating}</span>
            </p>
            <p>
                <span>🌟</span>
                <span>{avgUserRating}</span>
            </p>
            <p>
                <span>⏳</span>
                <span>{avgRuntime} min</span>
            </p>
        </div>
    </div>
}

function WatchedMovieList({ watched, ondeleteWatched }) {
    return <ul className="list">
        {watched.map((movie) => (
            <WatchedMovie movie={movie}
                key={movie.imdbID}
                ondeleteWatched={ondeleteWatched}
            />
        ))}
    </ul>
}
function WatchedMovie({ movie, ondeleteWatched }) {
    return <li >
        <img src={movie.poster} alt={`${movie.title} poster`} />
        <h3>{movie.title}</h3>
        <div>
            <p>
                <span>⭐️</span>
                <span>{movie.imdbRating}</span>
            </p>
            <p>
                <span>🌟</span>
                <span>{movie.userRating}</span>
            </p>
            <p>
                <span>⏳</span>
                <span>{movie.runtime} min</span>
            </p>
            <button className="btn-delete" onClick={() => ondeleteWatched(movie.imdbId)}>x</button>
        </div>
    </li>
}

function Main({ children }) {

    return <main className="main">

        {children}


    </main>
}

const average = (arr) =>
    arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function Loader() {
    return <p className="loader">Loading...</p>
}
function Error({ message }) {
    return <p className="error">{message}</p>
}
export default function Appv1() {

    const [query, setQuery] = useState("");

    const [watched, setWatched] = useLocalStorageState([], 'watched');
    // const [watched, setWatched] = useState(function () {
    //     let watchedStorage = localStorage.getItem('watched');
    //     return JSON.parse(watchedStorage);
    // });
    const [selectedId, setSelectedId] = useState(null);
    const { movies, error, isLoading } = useMovie(query);

    function handleSelectMovie(id) {
        setSelectedId((previd) => {
            if (previd === id)
                return null;
            else
                return id
        });
    }
    function handleClosedMovie() {
        setSelectedId(null);
    }

    function handleAddWatched(movie) {
        setWatched((watched) => [...watched, movie])
        // localStorage.setItem('watched', JSON.stringify([...watched, movie]))
    }
    function handleDeleteWatched(id) {
        setWatched(watched.filter(({ imdbId }) => imdbId !== id))
    }



    return (
        <>
            <Navbar >
                <Search query={query} setQuery={setQuery} />
                <NumResults movies={movies} />
            </Navbar>
            <Main>
                <Box >
                    {/* {isLoading ? <Loader /> :
                        <MovieList movies={movies}>
                            <Movie />
                        </MovieList>} */}

                    {isLoading && error === "" && <Loader />}
                    {!isLoading && error === "" && <MovieList movies={movies} handleSelectMovie={handleSelectMovie}

                    />}
                    {error !== "" ? <Error message={error} /> : null}



                </Box>
                <Box >
                    {selectedId ? <MovieDetails selectedId={selectedId} onCloseMovie={handleClosedMovie} onAddWatched={handleAddWatched} watched={watched} />
                        :
                        <>
                            <WatchedSummary watched={watched} />

                            <WatchedMovieList watched={watched} ondeleteWatched={handleDeleteWatched} />
                        </>
                    }

                </Box>
            </Main>

        </>
    );
}
