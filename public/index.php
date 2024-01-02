<?php
    // Manifest
    $manifest = json_decode(file_get_contents("dist/_manifest.json"), true);

    // OpenGraph
    $ogTitle;
    $ogDescription;
    $ogImage;

    function getModalInfo() {
        if (isset($_GET["m"])) {
            $modal = explode("-", $_GET["m"]);

            if (isset($modal[0]) && ($modal[0] === "m" || $modal[0] === "s") && isset($modal[1]) && $modal[1] !== "") {
                return $modal;
            }
        }

        return null;
    }

    $tmdbBaseURL = "https://api.themoviedb.org";
    $tmdbVersion = "3";
    $tmdbKey = "5622cafbfe8f8cfe358a29c53e19bba0";
    $tmdbLanguage = "en";
    $tmdbImageURL = "https://image.tmdb.org/t/p";
    $tmdbImageSize = "w342";
    $tmdbURL = "{$tmdbBaseURL}/${tmdbVersion}";

    $modal = getModalInfo();

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

                $ogTitle = $title;
                $ogDescription = $description;

                if (isset($data["poster_path"])) {
                    $path = $data["poster_path"];
                    $ogImage = "{$tmdbImageURL}/{$tmdbImageSize}{$path}";
                }
            }
        }
    }
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta property="og:title" content="<?= isset($ogTitle) ? $ogTitle : "FilmHaven" ?>">
        <meta property="og:description" content="<?= isset($ogDescription) ? $ogDescription : "A catalog of thousands of movies & shows, at your fingertips." ?>">
        <meta property="og:image" content="<?= isset($ogImage) ? $ogImage : "" ?>">
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png">
        <link rel="manifest" href="/icons/site.webmanifest">
        <link rel="stylesheet" href="<?= "/dist/{$manifest["styles.css"]}" ?>">
        <script src="<?= "/dist/{$manifest["main.js"]}" ?>" defer></script>
    </head>
</html>