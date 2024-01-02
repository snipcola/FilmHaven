<!DOCTYPE html>
<html>
<?php
	/*
		Provider:
		https://www.superembed.stream
	*/

	$player_font = "Open+Sans";
	$player_bg_color = "1A1A1A";
	$player_font_color = "ebebeb";
	$player_primary_color = "e43636";
	$player_secondary_color = "e43636";
	$player_loader = 3;
	$preferred_server = 0;
	$player_sources_toggle_type = 2;

	if (isset($_GET["t"])) {
		$theme = $_GET["t"];

		if ($theme === "light") {
			$player_bg_color = "d8d3d3";
			$player_font_color = "adadad";
		}
	}

	if(isset($_GET["v"])) {
		$id = $_GET["v"];
		$season = 0;
		$episode = 0;
		$player_url = "";
		
		if (isset($_GET["s"])) {
			$season = $_GET["s"];
		}
		
		if(isset($_GET["e"])) {
			$episode = $_GET["e"];
		}
		
		$request_url = "https://getsuperembed.link/?video_id={$id}&tmdb=1&season={$season}&episode={$episode}&player_font={$player_font}&player_bg_color={$player_bg_color}&player_font_color={$player_font_color}&player_primary_color={$player_primary_color}&player_secondary_color={$player_secondary_color}&player_loader={$player_loader}&preferred_server={$preferred_server}&player_sources_toggle_type={$player_sources_toggle_type}";
		$ch = curl_init();

		curl_setopt($ch, CURLOPT_URL, $request_url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
		curl_setopt($ch, CURLOPT_TIMEOUT, 8);
		curl_setopt($ch, CURLOPT_HEADER, false);
		
		$response = curl_exec($ch);
		curl_close($ch);

		$location = "";
		
		if(!empty($response)) {
			$location = $response;
		} else {
			// Fallback
			if (isset($_GET["s"]) && isset($_GET["e"])) {
				$location = "https://vidsrc.to/embed/tv/{$id}/{$season}/{$episode}";
			} else {
				$location = "https://vidsrc.to/embed/movie/{$id}";
			}
		}

		header("Location: {$location}");
	}
?>
</html>