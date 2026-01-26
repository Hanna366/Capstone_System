<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeviceData extends Model
{
    use HasFactory;

    protected $fillable = [
        'battery_level',
        'is_charging',
        'current_output',
        'temperature',
        'humidity',
        'uv_index',
        'wind_speed',
        'rack_position',
        'auto_mode',
        'connected',
        'last_update'
    ];

    protected $casts = [
        'battery_level' => 'decimal:2',
        'current_output' => 'decimal:2',
        'temperature' => 'decimal:2',
        'humidity' => 'decimal:2',
        'uv_index' => 'integer',
        'wind_speed' => 'decimal:2',
        'is_charging' => 'boolean',
        'auto_mode' => 'boolean',
        'connected' => 'boolean',
        'last_update' => 'datetime',
        'rack_position' => 'string'
    ];

    protected $attributes = [
        'battery_level' => 85.00,
        'is_charging' => true,
        'current_output' => 102.80,
        'temperature' => 26.00,
        'humidity' => 58.00,
        'uv_index' => 7,
        'wind_speed' => 10.00,
        'rack_position' => 'extended',
        'auto_mode' => true,
        'connected' => true,
    ];

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);
        
        if (!$this->exists) {
            $this->last_update = now();
        }
    }

    // Simulate data changes for demo purposes
    public function simulateChanges()
    {
        $this->battery_level = max(0, min(100, $this->battery_level + (random_int(-200, 200) / 100)));
        $this->current_output = max(0, $this->current_output + (random_int(-500, 500) / 100));
        $this->temperature = max(-10, min(50, $this->temperature + (random_int(-300, 300) / 100)));
        $this->humidity = max(0, min(100, $this->humidity + (random_int(-500, 500) / 100)));
        $this->uv_index = max(0, min(11, $this->uv_index + random_int(-2, 2)));
        $this->wind_speed = max(0, $this->wind_speed + (random_int(-300, 300) / 100));
        $this->last_update = now();
        
        $this->save();
    }
}