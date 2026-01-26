<?php

if (!function_exists('getComfortLevel')) {
    function getComfortLevel($deviceData) {
        $tempComfort = abs($deviceData->temperature - 22);
        $humComfort = abs($deviceData->humidity - 50);
        
        if ($tempComfort <= 3 && $humComfort <= 10 && $deviceData->uvIndex <= 5 && $deviceData->windSpeed <= 15) {
            return [ 
                'level' => 'Optimal', 
                'description' => 'Perfect conditions for outdoor drying',
                'color' => 'text-green-600'
            ];
        } elseif ($tempComfort <= 5 && $humComfort <= 15 && $deviceData->uvIndex <= 7 && $deviceData->windSpeed <= 20) {
            return [ 
                'level' => 'Good', 
                'description' => 'Acceptable conditions for outdoor drying',
                'color' => 'text-blue-600'
            ];
        } elseif ($tempComfort <= 8 && $humComfort <= 20 && $deviceData->uvIndex <= 9 && $deviceData->windSpeed <= 25) {
            return [ 
                'level' => 'Moderate', 
                'description' => 'Conditions are acceptable but monitor closely',
                'color' => 'text-yellow-600'
            ];
        } else {
            return [ 
                'level' => 'Poor', 
                'description' => 'Not suitable for outdoor drying',
                'color' => 'text-red-600'
            ];
        }
    }
}

if (!function_exists('getComfortClass')) {
    function getComfortClass($deviceData) {
        return getComfortLevel($deviceData)['color'];
    }
}

if (!function_exists('getRecommendations')) {
    function getRecommendations($deviceData) {
        $recs = [];
        
        if ($deviceData->humidity > 70) {
            $recs[] = 'High humidity - consider retracting rack';
        }
        
        if ($deviceData->uvIndex > 8) {
            $recs[] = 'High UV levels - clothes will dry faster but colors may fade';
        }
        
        if ($deviceData->windSpeed > 20) {
            $recs[] = 'Strong winds - secure clothes properly';
        }
        
        if ($deviceData->temperature < 15) {
            $recs[] = 'Low temperatures - drying will be slower';
        }
        
        if (count($recs) === 0) {
            $recs[] = 'Optimal conditions for drying';
        }
        
        return $recs;
    }
}