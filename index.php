<!DOCTYPE html>
<html lang="en">
    <head>
        <?php
            function getModalInfo() {
                if (isset($_GET["m"])) {
                    $modal = explode("-", $_GET["m"]);

                    if (isset($modal[0]) && ($modal[0] === "m" || $modal[0] === "s") && isset($modal[1]) && $modal[1] !== "") {
                        return $modal;
                    }
                }

                return null;
            }

            $modal = getModalInfo();

            $tmdbBaseURL = "https://api.themoviedb.org";
            $tmdbVersion = "3";
            $tmdbKey = "5622cafbfe8f8cfe358a29c53e19bba0";
            $tmdbLanguage = "en";

            $tmdbImageURL = "https://image.tmdb.org/t/p";
            $tmdbImageSize = "w342";

            $tmdbURL = "{$tmdbBaseURL}/${tmdbVersion}";

            if (isset($modal)) {
                $type = $modal[0] === "m" ? "movie" : "tv";
                $id = $modal[1];

                $ch = curl_init("{$tmdbURL}/{$type}/{$id}?api_key={$tmdbKey}&language={$tmdbLanguage}");
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

                $response = curl_exec($ch);
                curl_close($ch);

                if ($response !== false) {
                    $data = json_decode($response, true);

                    if (isset($data) && (isset($data["title"]) || isset($data["name"])) && (isset($data["overview"]) || isset($data["description"]))) {
                        $title = isset($data["title"]) ? $data["title"] : $data["name"];
                        $description = isset($data["overview"]) ? $data["overview"] : $data["description"];

                        echo "<meta property=\"og:title\" content=\"{$title}\">";

                        if (isset($data["poster_path"])) {
                            $path = $data["poster_path"];
                            echo "<meta property=\"og:image\" content=\"{$tmdbImageURL}/{$tmdbImageSize}{$path}\">";
                        }

                        echo "<meta property=\"og:description\" content=\"{$description}\">\n";
                    }
                }
            }
        ?>
        <title>FilmHaven</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="A catalog of thousands of movies & shows, at your fingertips.">
        <link rel="icon" href="./favicon.ico">
        <link rel="stylesheet" href="./external/normalize.min.css">
        <link rel="stylesheet" href="./external/fontawesome/style.min.css">
        <link rel="stylesheet" href="./styles/main.css">
        <script src="./scripts/main.js" type="module"></script>
    </head>
</html>