import { Movie } from '../types';

export const MOCK_MOVIES: Movie[] = [
  // ================= FEATURED ORIGINALS =================
  {
    id: "sam-story",
    title: "Sam Story",
    backdropPath: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200",
    posterPath: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600",
    overview: "Sam Story is an emotionally powerful original short film following Sam's life journey, personal struggles, heartwarming choices, and unexpected triumphs.",
    releaseYear: "2024",
    releaseDate: "2024-10-15",
    runtime: "18m",
    rating: 9.6,
    popularity: 99.9,
    genres: ["Drama", "Short Film", "Indie"],
    languages: ["Tamil", "English"],
    cast: [
      { name: "Sam", character: "Sam (Lead)", profilePath: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300" },
      { name: "Alex", character: "Best Friend", profilePath: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300" },
      { name: "Maya", character: "Mentor", profilePath: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300" }
    ],
    crew: [
      { name: "Sam", job: "Director" },
      { name: "Sam", job: "Writer" },
      { name: "Streamix Originals", job: "Producer" }
    ],
    budget: "Indie Original",
    revenue: "N/A",
    officialWebsite: "https://drive.google.com/file/d/1qhj4FV7KJIq_NI2amVZIceo_kd2obsfa/view?usp=sharing",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    youtubeKey: "",
    screenshots: [
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000",
      "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?q=80&w=1000"
    ],
    productionCompanies: ["Streamix Originals", "Sam Short Films"],
    similarIds: ["tam-1", "eng-1", "mal-1"],
    status: "Released"
  },

  // ================= ENGLISH =================
  {
    id: "eng-1",
    title: "Inception",
    backdropPath: "/8ZgRns3IC6C7fGgwsA2ui7j7nv4.jpg",
    posterPath: "https://m.media-amazon.com/images/M/MV5BMjExMjkwNTQ0Nl5BMl5BanBnXkFtZTcwNTY0OTk1Mw@@._V1_.jpg",
    overview: "Cobb, a skilled thief who steals valuable secrets from deep within the subconscious during the dream state, is given a chance at redemption: enter a target's mind and plant an idea.",
    releaseYear: "2010",
    releaseDate: "2010-07-16",
    runtime: "2h 28m",
    rating: 8.8,
    popularity: 92.5,
    genres: ["Action", "Sci-Fi", "Thriller", "Adventure"],
    languages: ["English"],
    cast: [
      { name: "Leonardo DiCaprio", character: "Cobb", profilePath: "/wo2hJv01zASi56zZ74CE4yJ7J21.jpg" },
      { name: "Joseph Gordon-Levitt", character: "Arthur", profilePath: "/429BE5m225Srv1qq2E8EsGOlK35.jpg" },
      { name: "Elliot Page", character: "Ariadne", profilePath: "/tpUo16VjOunN9Z4Fsh62bU1610s.jpg" },
      { name: "Tom Hardy", character: "Eames", profilePath: "/d81VyjJgxo2cbm4Q3vFc5xhMMAs.jpg" }
    ],
    crew: [
      { name: "Christopher Nolan", job: "Director" },
      { name: "Christopher Nolan", job: "Writer" },
      { name: "Emma Thomas", job: "Producer" }
    ],
    budget: "$160,000,000",
    revenue: "$836,836,967",
    officialWebsite: "https://www.warnerbros.com/movies/inception",
    youtubeKey: "YoHD9XEInc0",
    screenshots: [
      "/2A5XLI1UI56o6S1K719yXgZpZ4C.jpg",
      "/s26zS49733N6S7aN0X4Y0q15Z7Y.jpg"
    ],
    productionCompanies: ["Warner Bros. Pictures", "Legendary Pictures", "Syncopy"],
    similarIds: ["eng-2", "eng-5", "eng-10"],
    status: "Released"
  },
  {
    id: "eng-2",
    title: "Interstellar",
    backdropPath: "/xJHokZ86Rf595yisv5i7tPyiJ9Y.jpg",
    posterPath: "https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg",
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    releaseYear: "2014",
    releaseDate: "2014-11-05",
    runtime: "2h 49m",
    rating: 8.7,
    popularity: 98.4,
    genres: ["Sci-Fi", "Drama", "Adventure"],
    languages: ["English"],
    cast: [
      { name: "Matthew McConaughey", character: "Cooper", profilePath: "/1y45V4VqSg8pQ8t1692Yy0J1B7B.jpg" },
      { name: "Anne Hathaway", character: "Brand", profilePath: "/701Z7S427zY21262B4Yy46X2F82.jpg" },
      { name: "Jessica Chastain", character: "Murph", profilePath: "/23Yy45V426S8P8Yy46X2Z82A7D2.jpg" },
      { name: "Michael Caine", character: "Professor Brand", profilePath: "/1y7S4Yy2826S8P8Yy46X2Z82A7D2.jpg" }
    ],
    crew: [
      { name: "Christopher Nolan", job: "Director" },
      { name: "Christopher Nolan", job: "Writer" },
      { name: "Jonathan Nolan", job: "Writer" },
      { name: "Emma Thomas", job: "Producer" }
    ],
    budget: "$165,000,000",
    revenue: "$701,729,206",
    officialWebsite: "https://www.warnerbros.com/movies/interstellar",
    youtubeKey: "zSWdZAZe3gI",
    screenshots: [
      "/fii5S49826S8P8Yy46X2Z82A7D2.jpg",
      "/hii7S49826S8P8Yy46X2Z82A7D2.jpg"
    ],
    productionCompanies: ["Paramount Pictures", "Warner Bros. Pictures", "Legendary Pictures", "Syncopy"],
    similarIds: ["eng-1", "eng-5", "eng-6"],
    status: "Released"
  },
  {
    id: "eng-3",
    title: "The Dark Knight",
    backdropPath: "/dqK9Hag1054tghRQSqLSfrkvQnA.jpg",
    posterPath: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
    overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
    releaseYear: "2008",
    releaseDate: "2008-07-16",
    runtime: "2h 32m",
    rating: 9.0,
    popularity: 97.2,
    genres: ["Action", "Crime", "Drama", "Thriller"],
    languages: ["English"],
    cast: [
      { name: "Christian Bale", character: "Bruce Wayne / Batman", profilePath: "/b7fggui18Yy01zASi56zZ74CE4.jpg" },
      { name: "Heath Ledger", character: "Joker", profilePath: "/ HeathLedgerProfilePath.jpg" },
      { name: "Gary Oldman", character: "Jim Gordon", profilePath: "/garyoldmanProfile.jpg" },
      { name: "Aaron Eckhart", character: "Harvey Dent", profilePath: "/aaroneckhartProfile.jpg" }
    ],
    crew: [
      { name: "Christopher Nolan", job: "Director" },
      { name: "Christopher Nolan", job: "Writer" },
      { name: "Jonathan Nolan", job: "Writer" }
    ],
    budget: "$185,000,000",
    revenue: "$1,006,234,167",
    officialWebsite: "https://www.warnerbros.com/movies/dark-knight",
    youtubeKey: "LDG9bisJEaI",
    similarIds: ["eng-1", "eng-2", "eng-6"],
    status: "Released"
  },
  {
    id: "eng-4",
    title: "Dune: Part Two",
    backdropPath: "/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    posterPath: "https://m.media-amazon.com/images/I/61tJY4EWDpL._AC_UF1000,1000_QL80_.jpg",
    overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.",
    releaseYear: "2024",
    releaseDate: "2024-03-01",
    runtime: "2h 46m",
    rating: 8.6,
    popularity: 99.1,
    genres: ["Sci-Fi", "Adventure", "Action"],
    languages: ["English"],
    cast: [
      { name: "Timothée Chalamet", character: "Paul Atreides", profilePath: "/4Xy8V4y78Sg8pQ8t1692Yy0J1B.jpg" },
      { name: "Zendaya", character: "Chani", profilePath: "/701Z7S427zY21262B4Yy46X2F82.jpg" },
      { name: "Rebecca Ferguson", character: "Lady Jessica", profilePath: "/rebeccaferguson.jpg" }
    ],
    crew: [
      { name: "Denis Villeneuve", job: "Director" },
      { name: "Denis Villeneuve", job: "Writer" },
      { name: "Jon Spaihts", job: "Writer" }
    ],
    budget: "$190,000,000",
    revenue: "$712,000,000",
    officialWebsite: "https://www.dune.movie/",
    youtubeKey: "Way9Dexny3w",
    similarIds: ["eng-2", "eng-6"],
    status: "Released"
  },
  {
    id: "eng-5",
    title: "Oppenheimer",
    backdropPath: "/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    posterPath: "https://upload.wikimedia.org/wikipedia/en/f/f6/Oppenheimer_%28film%29_poster.jpg",
    overview: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
    releaseYear: "2023",
    releaseDate: "2023-07-21",
    runtime: "3h 00m",
    rating: 8.5,
    popularity: 94.6,
    genres: ["Drama", "History"],
    languages: ["English"],
    cast: [
      { name: "Cillian Murphy", character: "J. Robert Oppenheimer", profilePath: "/cillianmurphy.jpg" },
      { name: "Emily Blunt", character: "Kitty Oppenheimer", profilePath: "/emilyblunt.jpg" },
      { name: "Matt Damon", character: "Leslie Groves", profilePath: "/mattdamon.jpg" }
    ],
    crew: [
      { name: "Christopher Nolan", job: "Director" },
      { name: "Christopher Nolan", job: "Writer" }
    ],
    budget: "$100,000,000",
    revenue: "$957,000,000",
    officialWebsite: "https://www.oppenheimermovie.com/",
    youtubeKey: "uYPbbksJxIg",
    similarIds: ["eng-2", "eng-1"],
    status: "Released"
  },

  // ================= TAMIL =================
  {
    id: "tam-1",
    title: "Leo",
    backdropPath: "/yF1eOkaGQwM6BoxjbRTHqY4b20E.jpg",
    posterPath: "https://upload.wikimedia.org/wikipedia/en/c/cb/Leo_%282023_Indian_film%29_poster.jpg",
    overview: "Parthiban is a mild-mannered cafe owner in Himachal Pradesh, who becomes a local hero after rescue operations. However, his actions trigger a sequence of events connecting him to a deadly drug cartel who insist he is their long-lost associate, Leo Das.",
    releaseYear: "2023",
    releaseDate: "2023-10-19",
    runtime: "2h 44m",
    rating: 7.9,
    popularity: 88.6,
    genres: ["Action", "Crime", "Thriller"],
    languages: ["Tamil"],
    cast: [
      { name: "Vijay", character: "Parthiban / Leo Das", profilePath: "/vijayProfile.jpg" },
      { name: "Sanjay Dutt", character: "Antony Das", profilePath: "/sanjayduttProfile.jpg" },
      { name: "Arjun Sarja", character: "Harold Das", profilePath: "/arjunProfile.jpg" },
      { name: "Trisha Krishnan", character: "Sathya", profilePath: "/trishaProfile.jpg" }
    ],
    crew: [
      { name: "Lokesh Kanagaraj", job: "Director" },
      { name: "Lokesh Kanagaraj", job: "Writer" },
      { name: "S. S. Lalit Kumar", job: "Producer" }
    ],
    budget: "₹300 Crore",
    revenue: "₹620 Crore",
    youtubeKey: "coYw-eVqfGA",
    similarIds: ["tam-2", "tam-3", "tam-4"],
    status: "Released"
  },
  {
    id: "tam-2",
    title: "Jailer",
    backdropPath: "/5wNn3G613m8F3G9gD3H8bYQJ7D4.jpg",
    posterPath: "https://upload.wikimedia.org/wikipedia/en/e/e5/Jailer_2023_poster.jpg",
    overview: "Muthuvel Pandian, a retired jailer, goes on a manhunt to find his son's killers. However, he enters a complex web of art smuggling, mafia networks, and historical artifacts.",
    releaseYear: "2023",
    releaseDate: "2023-08-10",
    runtime: "2h 48m",
    rating: 8.0,
    popularity: 87.2,
    genres: ["Action", "Thriller", "Crime"],
    languages: ["Tamil"],
    cast: [
      { name: "Rajinikanth", character: "Muthuvel Pandian", profilePath: "/rajini.jpg" },
      { name: "Vinayakan", character: "Varman", profilePath: "/vinayakan.jpg" },
      { name: "Ramya Krishnan", character: "Vijaya", profilePath: "/ramya.jpg" }
    ],
    crew: [
      { name: "Nelson Dilipkumar", job: "Director" },
      { name: "Nelson Dilipkumar", job: "Writer" }
    ],
    budget: "₹200 Crore",
    revenue: "₹650 Crore",
    youtubeKey: "xenOE1T_OT8",
    similarIds: ["tam-1", "tam-3"],
    status: "Released"
  },
  {
    id: "tam-3",
    title: "Vikram",
    backdropPath: "/j6Y1sM9HnFj8Rz2rF57G149T5QO.jpg",
    posterPath: "https://upload.wikimedia.org/wikipedia/en/9/93/Vikram_2022_poster.jpg",
    overview: "A special agent investigates a murder committed by a masked group of serial killers. The road leads to a massive drug syndicate headed by Sandhanam, and a legendary black ops commander, Vikram.",
    releaseYear: "2022",
    releaseDate: "2022-06-03",
    runtime: "2h 55m",
    rating: 8.4,
    popularity: 89.1,
    genres: ["Action", "Thriller", "Crime"],
    languages: ["Tamil"],
    cast: [
      { name: "Kamal Haasan", character: "Vikram / Karnan", profilePath: "/kamal.jpg" },
      { name: "Vijay Sethupathi", character: "Sandhanam", profilePath: "/vjs.jpg" },
      { name: "Fahadh Faasil", character: "Amar", profilePath: "/fafa.jpg" },
      { name: "Suriya", character: "Rolex (Cameo)", profilePath: "/suriya.jpg" }
    ],
    crew: [
      { name: "Lokesh Kanagaraj", job: "Director" },
      { name: "Lokesh Kanagaraj", job: "Writer" }
    ],
    budget: "₹120 Crore",
    revenue: "₹450 Crore",
    youtubeKey: "OKBMCL-FRPU",
    similarIds: ["tam-1", "tam-4"],
    status: "Released"
  },
  {
    id: "tam-4",
    title: "Kaithi",
    backdropPath: "/8h5o2m2g2k2r6p6z6Wj4u6S4E4A.jpg",
    posterPath: "https://upload.wikimedia.org/wikipedia/en/0/03/Kaithi_2019_poster.jpg",
    overview: "Dilli, an ex-convict, endeavors to meet his daughter for the first time after leaving prison. However, his attempts are interrupted by an inspector who needs him to drive a truck full of unconscious cops to safety from drug lords.",
    releaseYear: "2019",
    releaseDate: "2019-10-25",
    runtime: "2h 27m",
    rating: 8.5,
    popularity: 84.3,
    genres: ["Action", "Thriller", "Crime"],
    languages: ["Tamil"],
    cast: [
      { name: "Karthi", character: "Dilli", profilePath: "/karthi.jpg" },
      { name: "Narain", character: "Inspector Bejoy", profilePath: "/narain.jpg" }
    ],
    crew: [
      { name: "Lokesh Kanagaraj", job: "Director" }
    ],
    budget: "₹25 Crore",
    revenue: "₹105 Crore",
    youtubeKey: "g5S5v4P8l1s",
    similarIds: ["tam-3", "tam-1"],
    status: "Released"
  },
  {
    id: "tam-5",
    title: "Soorarai Pottru",
    backdropPath: "/g9a3uU3W1w2L7n9x7X5tJ2y7X1y.jpg",
    posterPath: "https://upload.wikimedia.org/wikipedia/en/b/b3/Soorarai_Pottru.jpg",
    overview: "Nedumaaran Rajangam, a former Air Force captain, dreams of launching a low-cost airline for the common people, overcoming massive corporate conspiracies and financial hurdles.",
    releaseYear: "2020",
    releaseDate: "2020-11-12",
    runtime: "2h 33m",
    rating: 8.7,
    popularity: 82.1,
    genres: ["Drama"],
    languages: ["Tamil"],
    cast: [
      { name: "Suriya", character: "Nedumaaran Rajangam (Maara)", profilePath: "/suriya.jpg" },
      { name: "Aparna Balamurali", character: "Sundhavi Nedumaaran (Bommi)", profilePath: "/aparna.jpg" }
    ],
    crew: [
      { name: "Sudha Kongara", job: "Director" },
      { name: "Sudha Kongara", job: "Writer" }
    ],
    budget: "₹45 Crore",
    revenue: "₹170 Crore",
    youtubeKey: "fa_DIwRsa9o",
    similarIds: ["tam-3"],
    status: "Released"
  },

  // ================= TELUGU =================
  {
    id: "tel-1",
    title: "RRR",
    backdropPath: "/n7E4R8a0ZkX5D0f8rG9c8k1Pq6y.jpg",
    posterPath: "https://upload.wikimedia.org/wikipedia/en/d/d7/RRR_Poster.jpg",
    overview: "A fictional history of two legendary revolutionaries and their journey away from home before they began fighting for their country in the 1920s.",
    releaseYear: "2022",
    releaseDate: "2022-03-25",
    runtime: "3h 02m",
    rating: 8.3,
    popularity: 95.8,
    genres: ["Action", "Drama", "History", "Adventure"],
    languages: ["Telugu"],
    cast: [
      { name: "N. T. Rama Rao Jr.", character: "Komaram Bheem", profilePath: "/jrntr.jpg" },
      { name: "Ram Charan", character: "Alluri Sitarama Raju", profilePath: "/ramcharan.jpg" },
      { name: "Alia Bhatt", character: "Sita", profilePath: "/aliabhatt.jpg" },
      { name: "Ajay Devgn", character: "Venata Rama Raju", profilePath: "/ajay.jpg" }
    ],
    crew: [
      { name: "S. S. Rajamouli", job: "Director" },
      { name: "V. Vijayendra Prasad", job: "Writer" }
    ],
    budget: "₹550 Crore",
    revenue: "₹1,300 Crore",
    youtubeKey: "NgBoMJy386M",
    similarIds: ["tel-2", "tel-3"],
    status: "Released"
  },
  {
    id: "tel-2",
    title: "Baahubali: The Beginning",
    backdropPath: "/x5uO7N5y52f1e6f5c8a2b4b4e9f.jpg",
    posterPath: "https://upload.wikimedia.org/wikipedia/en/7/7e/Baahubali_the_beginning_poster.jpg",
    overview: "In ancient Kingdom of Mahishmati, a young, adventurous man Sivudu falls in love with a warrior woman. While trying to win her heart, he discovers a heroic royal lineage and his father's historical battle against evil.",
    releaseYear: "2015",
    releaseDate: "2015-07-10",
    runtime: "2h 39m",
    rating: 8.1,
    popularity: 91.2,
    genres: ["Action", "Fantasy", "Adventure", "Drama"],
    languages: ["Telugu"],
    cast: [
      { name: "Prabhas", character: "Amarendra Baahubali / Mahendra Baahubali", profilePath: "/prabhas.jpg" },
      { name: "Rana Daggubati", character: "Bhallaladeva", profilePath: "/rana.jpg" },
      { name: "Anushka Shetty", character: "Devasena", profilePath: "/anushka.jpg" },
      { name: "Tamannaah Bhatia", character: "Avanthika", profilePath: "/tamannaah.jpg" }
    ],
    crew: [
      { name: "S. S. Rajamouli", job: "Director" }
    ],
    budget: "₹180 Crore",
    revenue: "₹650 Crore",
    youtubeKey: "sOEg_QqV_AM",
    similarIds: ["tel-1", "tel-3"],
    status: "Released"
  },
  {
    id: "tel-3",
    title: "Kalki 2898 AD",
    backdropPath: "/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    posterPath: "https://m.media-amazon.com/images/M/MV5BMTM3ZGUwYTEtZTI5NS00ZmMyLTk2YmQtMWU4YjlhZTI3NjRjXkEyXkFqcGc@._V1_.jpg",
    overview: "A modern avatar of Vishnu, a Hindu god, is believed to have descended to Earth to protect the world from evil forces in a futuristic dystopian city of Kasi.",
    releaseYear: "2024",
    releaseDate: "2024-06-27",
    runtime: "3h 01m",
    rating: 8.0,
    popularity: 97.4,
    genres: ["Sci-Fi", "Action", "Fantasy", "Adventure"],
    languages: ["Telugu"],
    cast: [
      { name: "Prabhas", character: "Bhairava", profilePath: "/prabhas.jpg" },
      { name: "Amitabh Bachchan", character: "Ashwatthama", profilePath: "/amitabh.jpg" },
      { name: "Kamal Haasan", character: "Supreme Yaskin", profilePath: "/kamal.jpg" },
      { name: "Deepika Padukone", character: "Sumathi", profilePath: "/deepika.jpg" }
    ],
    crew: [
      { name: "Nag Ashwin", job: "Director" },
      { name: "Nag Ashwin", job: "Writer" }
    ],
    budget: "₹600 Crore",
    revenue: "₹1,050 Crore",
    youtubeKey: "kQDd1AhGI90",
    similarIds: ["tel-1", "tel-2"],
    status: "Released"
  },
  {
    id: "tel-4",
    title: "Pushpa: The Rise",
    backdropPath: "/wYdO5UoPZ5P3Wd5H1mP152n562q.jpg",
    posterPath: "https://m.media-amazon.com/images/M/MV5BZjJmMjJmYWMtNTQyYy00NzcxLWE5N2EtMTY5NjRhMGZmYjNlXkEyXkFqcGc@._V1_.jpg",
    overview: "Pushpa Raj, a coolie, rises in the world of red sandalwood smuggling. Along the way, he makes enemies, fights police, and meets Srivalli, his love interest.",
    releaseYear: "2021",
    releaseDate: "2021-12-17",
    runtime: "2h 59m",
    rating: 7.8,
    popularity: 90.1,
    genres: ["Action", "Crime", "Thriller"],
    languages: ["Telugu"],
    cast: [
      { name: "Allu Arjun", character: "Pushpa Raj", profilePath: "/alluarjun.jpg" },
      { name: "Fahadh Faasil", character: "SP Bhanwar Singh Shekhawat", profilePath: "/fafa.jpg" },
      { name: "Rashmika Mandanna", character: "Srivalli", profilePath: "/rashmika.jpg" }
    ],
    crew: [
      { name: "Sukumar", job: "Director" },
      { name: "Sukumar", job: "Writer" }
    ],
    budget: "₹170 Crore",
    revenue: "₹370 Crore",
    youtubeKey: "Q1DYK9U509o",
    similarIds: ["tel-1", "tel-5"],
    status: "Released"
  },
  {
    id: "tel-5",
    title: "Pushpa 2: The Rule",
    backdropPath: "/wYdO5UoPZ5P3Wd5H1mP152n562q.jpg",
    posterPath: "https://m.media-amazon.com/images/M/MV5BZjJmMjJmYWMtNTQyYy00NzcxLWE5N2EtMTY5NjRhMGZmYjNlXkEyXkFqcGc@._V1_.jpg",
    overview: "The clash between Pushpa Raj and Bhanwar Singh continues in this action-packed sequel. Pushpa now rules the smuggling empire and faces global competition.",
    releaseYear: "2024",
    releaseDate: "2024-12-05",
    runtime: "3h 02m",
    rating: 8.2,
    popularity: 98.9,
    genres: ["Action", "Crime", "Thriller"],
    languages: ["Telugu"],
    cast: [
      { name: "Allu Arjun", character: "Pushpa Raj", profilePath: "/alluarjun.jpg" },
      { name: "Fahadh Faasil", character: "SP Bhanwar Singh Shekhawat", profilePath: "/fafa.jpg" },
      { name: "Rashmika Mandanna", character: "Srivalli", profilePath: "/rashmika.jpg" }
    ],
    crew: [
      { name: "Sukumar", job: "Director" }
    ],
    budget: "₹500 Crore",
    revenue: "₹1,000+ Crore",
    youtubeKey: "1kVK0MZlbI4",
    similarIds: ["tel-4", "tel-3"],
    status: "Released"
  },

  // ================= HINDI =================
  {
    id: "hin-1",
    title: "Jawan",
    backdropPath: "/yF1eOkaGQwM6BoxjbRTHqY4b20E.jpg",
    posterPath: "https://upload.wikimedia.org/wikipedia/en/3/39/Jawan_film_poster.jpg",
    overview: "A personal grudge drives a man to rectify the wrongs in society, while kept by a promise made years ago. He confronts a monstrous outlaw who knows no fear and has caused extreme suffering to many.",
    releaseYear: "2023",
    releaseDate: "2023-09-07",
    runtime: "2h 49m",
    rating: 8.0,
    popularity: 91.5,
    genres: ["Action", "Thriller", "Crime"],
    languages: ["Hindi"],
    cast: [
      { name: "Shah Rukh Khan", character: "Vikram Rathore / Azad", profilePath: "/srk.jpg" },
      { name: "Nayanthara", character: "Narmada Rai", profilePath: "/nayanthara.jpg" },
      { name: "Vijay Sethupathi", character: "Kaalie Gaikwad", profilePath: "/vjs.jpg" },
      { name: "Deepika Padukone", character: "Aishwarya Rathore (Special)", profilePath: "/deepika.jpg" }
    ],
    crew: [
      { name: "Atlee", job: "Director" },
      { name: "Atlee", job: "Writer" }
    ],
    budget: "₹300 Crore",
    revenue: "₹1,150 Crore",
    youtubeKey: "COv5277cA4Y",
    similarIds: ["hin-2", "hin-4"],
    status: "Released"
  },
  {
    id: "hin-2",
    title: "Pathaan",
    backdropPath: "/j6Y1sM9HnFj8Rz2rF57G149T5QO.jpg",
    posterPath: "https://upload.wikimedia.org/wikipedia/en/c/c3/Pathaan_film_poster.jpg",
    overview: "An Indian spy agent, Pathaan, takes on a mercenary group headed by Jim, a rogue agent, who plans to launch a deadly biological attack against India.",
    releaseYear: "2023",
    releaseDate: "2023-01-25",
    runtime: "2h 26m",
    rating: 7.5,
    popularity: 88.9,
    genres: ["Action", "Thriller"],
    languages: ["Hindi"],
    cast: [
      { name: "Shah Rukh Khan", character: "Pathaan", profilePath: "/srk.jpg" },
      { name: "John Abraham", character: "Jim", profilePath: "/john.jpg" },
      { name: "Deepika Padukone", character: "Rubina Mohsin", profilePath: "/deepika.jpg" }
    ],
    crew: [
      { name: "Siddharth Anand", job: "Director" }
    ],
    budget: "₹250 Crore",
    revenue: "₹1,050 Crore",
    youtubeKey: "vqu4z34wENw",
    similarIds: ["hin-1", "hin-4"],
    status: "Released"
  },
  {
    id: "hin-3",
    title: "3 Idiots",
    backdropPath: "/8ZgRns3IC6C7fGgwsA2ui7j7nv4.jpg",
    posterPath: "https://upload.wikimedia.org/wikipedia/en/d/df/3_idiots_poster.jpg",
    overview: "Two friends search for their long-lost companion. They revisit their college days and recall the memories of their friend who inspired them to think differently, even as the rest of the world called them idiots.",
    releaseYear: "2009",
    releaseDate: "2009-12-25",
    runtime: "2h 50m",
    rating: 8.9,
    popularity: 86.4,
    genres: ["Comedy", "Drama"],
    languages: ["Hindi"],
    cast: [
      { name: "Aamir Khan", character: "Ranchoddas 'Rancho' Shamaldas Chanchad", profilePath: "/aamir.jpg" },
      { name: "R. Madhavan", character: "Farhan Qureshi", profilePath: "/madhavan.jpg" },
      { name: "Sharman Joshi", character: "Raju Rastogi", profilePath: "/sharman.jpg" },
      { name: "Kareena Kapoor", character: "Pia Sahastrabuddhe", profilePath: "/kareena.jpg" }
    ],
    crew: [
      { name: "Rajkumar Hirani", job: "Director" },
      { name: "Abhijat Joshi", job: "Writer" }
    ],
    budget: "₹55 Crore",
    revenue: "₹460 Crore",
    youtubeKey: "K0eDb33dm0Y",
    similarIds: ["hin-5"],
    status: "Released"
  },
  {
    id: "hin-4",
    title: "Animal",
    backdropPath: "/5wNn3G613m8F3G9gD3H8bYQJ7D4.jpg",
    posterPath: "https://upload.wikimedia.org/wikipedia/en/9/99/Animal_%282023_film%29_poster.jpg",
    overview: "A son's obsessive love for his father leads to a brutal path of violence, crime, and conflict with an antagonist who wants to destroy his entire family.",
    releaseYear: "2023",
    releaseDate: "2023-12-01",
    runtime: "3h 21m",
    rating: 7.2,
    popularity: 93.1,
    genres: ["Action", "Crime", "Drama"],
    languages: ["Hindi"],
    cast: [
      { name: "Ranbir Kapoor", character: "Ranvijay Singh / Aziz Haque", profilePath: "/ranbir.jpg" },
      { name: "Anil Kapoor", character: "Balbir Singh", profilePath: "/anil.jpg" },
      { name: "Bobby Deol", character: "Abrar Haque", profilePath: "/bobby.jpg" },
      { name: "Rashmika Mandanna", character: "Gitanjali", profilePath: "/rashmika.jpg" }
    ],
    crew: [
      { name: "Sandeep Reddy Vanga", job: "Director" },
      { name: "Sandeep Reddy Vanga", job: "Writer" }
    ],
    budget: "₹100 Crore",
    revenue: "₹915 Crore",
    youtubeKey: "8FkLRUJj-C0",
    similarIds: ["hin-1", "tel-4"],
    status: "Released"
  },
  {
    id: "hin-5",
    title: "Dangal",
    backdropPath: "/g9a3uU3W1w2L7n9x7X5tJ2y7X1y.jpg",
    posterPath: "https://upload.wikimedia.org/wikipedia/en/9/90/Dangal_poster.jpg",
    overview: "Former wrestler Mahavir Singh Phogat and his two wrestler daughters struggle towards glory at the Commonwealth Games in the face of societal oppression.",
    releaseYear: "2016",
    releaseDate: "2016-12-23",
    runtime: "2h 41m",
    rating: 8.8,
    popularity: 85.2,
    genres: ["Drama", "Family"],
    languages: ["Hindi"],
    cast: [
      { name: "Aamir Khan", character: "Mahavir Singh Phogat", profilePath: "/aamir.jpg" },
      { name: "Fatima Sana Shaikh", character: "Geeta Phogat", profilePath: "/fatima.jpg" },
      { name: "Sanya Malhotra", character: "Babita Kumari Phogat", profilePath: "/sanya.jpg" }
    ],
    crew: [
      { name: "Nitesh Tiwari", job: "Director" }
    ],
    budget: "₹70 Crore",
    revenue: "₹2,000+ Crore",
    youtubeKey: "x_7YlGv9u1g",
    similarIds: ["hin-3"],
    status: "Released"
  },

  // ================= MALAYALAM =================
  {
    id: "mal-1",
    title: "Manjummel Boys",
    backdropPath: "/8h5o2m2g2k2r6p6z6Wj4u6S4E4A.jpg",
    posterPath: "https://upload.wikimedia.org/wikipedia/en/0/05/Manjummel_Boys_poster.jpg",
    overview: "A group of friends from a small town called Manjummel go on a vacation trip to Kodaikanal. When one of their friends falls into the deep and dangerous Guna Cave, the boys unite in a daring rescue operation.",
    releaseYear: "2024",
    releaseDate: "2024-02-22",
    runtime: "2h 15m",
    rating: 8.5,
    popularity: 91.2,
    genres: ["Thriller", "Drama", "Adventure"],
    languages: ["Malayalam"],
    cast: [
      { name: "Soubin Shahir", character: "Kuttan", profilePath: "/soubin.jpg" },
      { name: "Sreenath Bhasi", character: "Subhash", profilePath: "/sreenath.jpg" },
      { name: "Balasubramanian", character: "Six-Pack Prasad", profilePath: "/bala.jpg" }
    ],
    crew: [
      { name: "Chidambaram", job: "Director" },
      { name: "Chidambaram", job: "Writer" }
    ],
    budget: "₹20 Crore",
    revenue: "₹240 Crore",
    youtubeKey: "l28dJ2B6p5g",
    similarIds: ["mal-2", "mal-3"],
    status: "Released"
  },
  {
    id: "mal-2",
    title: "Premalu",
    backdropPath: "/j6Y1sM9HnFj8Rz2rF57G149T5QO.jpg",
    posterPath: "https://upload.wikimedia.org/wikipedia/en/e/e0/Premalu_poster.jpg",
    overview: "Sachin moves to Hyderabad for a gate coaching class and falls in love with Reenu, an IT employee. However, a comedy of errors and competition follows.",
    releaseYear: "2024",
    releaseDate: "2024-02-09",
    runtime: "2h 36m",
    rating: 8.2,
    popularity: 89.6,
    genres: ["Comedy", "Romance"],
    languages: ["Malayalam"],
    cast: [
      { name: "Naslen K. Gafoor", character: "Sachin", profilePath: "/naslen.jpg" },
      { name: "Mamitha Baiju", character: "Reenu", profilePath: "/mamitha.jpg" },
      { name: "Shyam Mohan", character: "Aadhi", profilePath: "/shyam.jpg" }
    ],
    crew: [
      { name: "Girish A. D.", job: "Director" }
    ],
    budget: "₹10 Crore",
    revenue: "₹136 Crore",
    youtubeKey: "rP35tK6WnPE",
    similarIds: ["mal-1", "mal-5"],
    status: "Released"
  },
  {
    id: "mal-3",
    title: "Bramayugam",
    backdropPath: "/8ZgRns3IC6C7fGgwsA2ui7j7nv4.jpg",
    posterPath: "https://upload.wikimedia.org/wikipedia/en/c/ca/Bramayugam_poster.jpg",
    overview: "The story of a court singer, Thevan, who gets lost in a mysterious forest and stumbles upon a grand mana (mansion) owned by Kodumon Potti, an enigmatic host with darker secrets.",
    releaseYear: "2024",
    releaseDate: "2024-02-15",
    runtime: "2h 19m",
    rating: 8.3,
    popularity: 88.5,
    genres: ["Horror", "Thriller", "Fantasy"],
    languages: ["Malayalam"],
    cast: [
      { name: "Mammootty", character: "Kodumon Potti", profilePath: "/mammootty.jpg" },
      { name: "Arjun Ashokan", character: "Thevan", profilePath: "/arjun_ashokan.jpg" },
      { name: "Sidharth Bharathan", character: "Cook", profilePath: "/sidharth.jpg" }
    ],
    crew: [
      { name: "Rahul Sadasivan", job: "Director" },
      { name: "Rahul Sadasivan", job: "Writer" }
    ],
    budget: "₹15 Crore",
    revenue: "₹60 Crore",
    youtubeKey: "8m05C2Yk5_A",
    similarIds: ["mal-1", "mal-4"],
    status: "Released"
  },
  {
    id: "mal-4",
    title: "Drishyam",
    backdropPath: "/8h5o2m2g2k2r6p6z6Wj4u6S4E4A.jpg",
    posterPath: "https://upload.wikimedia.org/wikipedia/en/b/b5/Drishyam_2013_poster.jpg",
    overview: "A common family man, Georgekutty, goes to extreme and ingenious lengths to protect his family when they commit an accidental murder of an IG's son.",
    releaseYear: "2013",
    releaseDate: "2013-12-19",
    runtime: "2h 40m",
    rating: 8.8,
    popularity: 85.1,
    genres: ["Thriller", "Crime", "Drama"],
    languages: ["Malayalam"],
    cast: [
      { name: "Mohanlal", character: "Georgekutty", profilePath: "/mohanlal.jpg" },
      { name: "Meena", character: "Rani George", profilePath: "/meena.jpg" },
      { name: "Asha Sarath", character: "IG Geetha Prabhakar", profilePath: "/asha.jpg" }
    ],
    crew: [
      { name: "Jeethu Joseph", job: "Director" },
      { name: "Jeethu Joseph", job: "Writer" }
    ],
    budget: "₹5 Crore",
    revenue: "₹50 Crore",
    youtubeKey: "e8fB_t0vM5g",
    similarIds: ["mal-3"],
    status: "Released"
  },

  // ================= KANNADA =================
  {
    id: "kan-1",
    title: "K.G.F: Chapter 1",
    backdropPath: "/j6Y1sM9HnFj8Rz2rF57G149T5QO.jpg",
    posterPath: "https://m.media-amazon.com/images/M/MV5BM2M0YmIxNzItOWI4My00MmQzLWE0NGYtZTM3NjllNjIwZjc5XkEyXkFqcGc@._V1_.jpg",
    overview: "Rocky, a young orphan, rises to power as a dreaded gangster in Mumbai, before being sent to the Kolar Gold Fields to assassinate Garuda, the ruthless boss who rules over slaves.",
    releaseYear: "2018",
    releaseDate: "2018-12-21",
    runtime: "2h 35m",
    rating: 8.2,
    popularity: 91.2,
    genres: ["Action", "Crime", "Drama"],
    languages: ["Kannada"],
    cast: [
      { name: "Yash", character: "Raja Krishnappa Bairya (Rocky)", profilePath: "/yash.jpg" },
      { name: "Srinidhi Shetty", character: "Reena Desai", profilePath: "/srinidhi.jpg" },
      { name: "Ramachandra Raju", character: "Garuda", profilePath: "/garuda.jpg" }
    ],
    crew: [
      { name: "Prashanth Neel", job: "Director" },
      { name: "Prashanth Neel", job: "Writer" }
    ],
    budget: "₹80 Crore",
    revenue: "₹250 Crore",
    youtubeKey: "qXgF-iJb_9E",
    similarIds: ["kan-2", "kan-3"],
    status: "Released"
  },
  {
    id: "kan-2",
    title: "K.G.F: Chapter 2",
    backdropPath: "/j6Y1sM9HnFj8Rz2rF57G149T5QO.jpg",
    posterPath: "https://m.media-amazon.com/images/M/MV5BM2M0YmIxNzItOWI4My00MmQzLWE0NGYtZTM3NjllNjIwZjc5XkEyXkFqcGc@._V1_.jpg",
    overview: "In the blood-soaked Kolar Gold Fields, Rocky's name strikes fear into his foes. While his allies look up to Rocky as their savior, the government sees him as a threat to law and order, and he faces Adheera.",
    releaseYear: "2022",
    releaseDate: "2022-04-14",
    runtime: "2h 48m",
    rating: 8.4,
    popularity: 96.1,
    genres: ["Action", "Crime", "Drama"],
    languages: ["Kannada"],
    cast: [
      { name: "Yash", character: "Raja Krishnappa Bairya (Rocky)", profilePath: "/yash.jpg" },
      { name: "Sanjay Dutt", character: "Adheera", profilePath: "/sanjaydutt.jpg" },
      { name: "Raveena Tandon", character: "Ramika Sen", profilePath: "/raveena.jpg" },
      { name: "Srinidhi Shetty", character: "Reena Desai", profilePath: "/srinidhi.jpg" }
    ],
    crew: [
      { name: "Prashanth Neel", job: "Director" }
    ],
    budget: "₹100 Crore",
    revenue: "₹1,250 Crore",
    youtubeKey: "JKa05nyUook",
    similarIds: ["kan-1", "kan-3"],
    status: "Released"
  },
  {
    id: "kan-3",
    title: "Kantara",
    backdropPath: "/x5uO7N5y52f1e6f5c8a2b4b4e9f.jpg",
    posterPath: "https://upload.wikimedia.org/wikipedia/en/8/84/Kantara_poster.jpg",
    overview: "A champion Kambala athlete, Shiva, comes into conflict with a forest officer, Murali, who tries to establish order in a tribal village where spirits guard the forests.",
    releaseYear: "2022",
    releaseDate: "2022-09-30",
    runtime: "2h 30m",
    rating: 8.3,
    popularity: 90.5,
    genres: ["Action", "Thriller", "Fantasy", "Drama"],
    languages: ["Kannada"],
    cast: [
      { name: "Rishab Shetty", character: "Shiva", profilePath: "/rishabshetty.jpg" },
      { name: "Sapthami Gowda", character: "Leela", profilePath: "/sapthami.jpg" },
      { name: "Kishore", character: "Murali", profilePath: "/kishore.jpg" }
    ],
    crew: [
      { name: "Rishab Shetty", job: "Director" },
      { name: "Rishab Shetty", job: "Writer" }
    ],
    budget: "₹16 Crore",
    revenue: "₹400 Crore",
    youtubeKey: "5JpeD7sV_6k",
    similarIds: ["kan-1", "kan-2"],
    status: "Released"
  },
  {
    id: "kan-4",
    title: "777 Charlie",
    backdropPath: "/xJHokZ86Rf595yisv5i7tPyiJ9Y.jpg",
    posterPath: "https://upload.wikimedia.org/wikipedia/en/d/db/777_Charlie_poster.jpg",
    overview: "Dharma is stuck in a rut with his negative lifestyle. An energetic Labrador pup, Charlie, enters his life and changes his perspective, leading him on a cross-country journey.",
    releaseYear: "2022",
    releaseDate: "2022-06-10",
    runtime: "2h 44m",
    rating: 8.9,
    popularity: 88.2,
    genres: ["Drama", "Comedy", "Family"],
    languages: ["Kannada"],
    cast: [
      { name: "Rakshit Shetty", character: "Dharma", profilePath: "/rakshit.jpg" },
      { name: "Charlie", character: "Charlie (Dog)", profilePath: "/dog.jpg" }
    ],
    crew: [
      { name: "Kiranraj K.", job: "Director" }
    ],
    budget: "₹20 Crore",
    revenue: "₹105 Crore",
    youtubeKey: "1s51W1sZ-5M",
    similarIds: ["kan-3"],
    status: "Released"
  }
];

export const MOCK_GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Thriller", "Crime", "Romance", "Horror", "Sci-Fi", "Fantasy", "Family", "Animation", "Documentary", "Short Film"
];

export const MOCK_LANGUAGES = [
  "English", "Tamil", "Telugu", "Hindi", "Malayalam", "Kannada"
];
