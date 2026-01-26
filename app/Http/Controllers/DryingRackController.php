<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\DeviceData;
use Illuminate\Http\Request;

class DryingRackController extends Controller
{
    public function index()
    {
        // Get or create device data
        $deviceData = DeviceData::first();
        
        if (!$deviceData) {
            $deviceData = DeviceData::create([
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
                'last_update' => now()
            ]);
        }
        
        // Simulate data changes for demo
        $deviceData->simulateChanges();
        
        return view('drying-rack.index', compact('deviceData'));
    }
    
    public function controlRack(Request $request)
    {
        $deviceData = DeviceData::first();
        
        if (!$deviceData) {
            return redirect()->back()->with('error', 'Device not found');
        }
        
        $validated = $request->validate([
            'action' => 'required|in:extend,retract'
        ]);
        
        $newPosition = $validated['action'] === 'extend' ? 'extended' : 'retracted';
        $deviceData->update([
            'rack_position' => $newPosition,
            'last_update' => now()
        ]);
        
        return redirect()->back()->with('success', "Rack {$validated['action']}ed successfully");
    }
    
    public function toggleAutoMode(Request $request)
    {
        $deviceData = DeviceData::first();
        
        if (!$deviceData) {
            return redirect()->back()->with('error', 'Device not found');
        }
        
        $validated = $request->validate([
            'enabled' => 'required|boolean'
        ]);
        
        $deviceData->update([
            'auto_mode' => $validated['enabled'],
            'last_update' => now()
        ]);
        
        $message = $validated['enabled'] ? 'Auto mode enabled' : 'Auto mode disabled';
        return redirect()->back()->with('success', $message);
    }
}
