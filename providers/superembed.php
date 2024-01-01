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

		if(isset($_GET['video_id'])) { $video_id = $_GET['video_id']; $is_tmdb = 0; $season = 0; $episode = 0; $player_url = ""; if(isset($_GET['tmdb'])) { $is_tmdb = $_GET['tmdb']; } if(isset($_GET['season'])) { $season = $_GET['season']; } else if (isset($_GET['s'])) { $season = $_GET['s']; } if(isset($_GET['episode'])) { $episode = $_GET['episode']; } else if(isset($_GET['e'])) { $episode = $_GET['e']; } if(!empty(trim($video_id))) { $request_url = "https://getsuperembed.link/?video_id=$video_id&tmdb=$is_tmdb&season=$season&episode=$episode&player_font=$player_font&player_bg_color=$player_bg_color&player_font_color=$player_font_color&player_primary_color=$player_primary_color&player_secondary_color=$player_secondary_color&player_loader=$player_loader&preferred_server=$preferred_server&player_sources_toggle_type=$player_sources_toggle_type"; if(function_exists('curl_version')) { $curl = curl_init(); curl_setopt($curl, CURLOPT_URL, $request_url); curl_setopt($curl, CURLOPT_RETURNTRANSFER, true); curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true); curl_setopt($curl, CURLOPT_TIMEOUT, 7); curl_setopt($curl, CURLOPT_HEADER, false); curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE); $player_url = curl_exec($curl); curl_close($curl); } else { $player_url = file_get_contents($request_url); } if(!empty($player_url)) { if(strpos($player_url,"https://") !== false) { header("Location: $player_url"); } else { echo "<span style='color:red'>$player_url</span>"; } } else { echo "Request server didn't respond"; } } else { echo "Missing video_id"; } } else { echo "Missing video_id"; }
	?>
</html>