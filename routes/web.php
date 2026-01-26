<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DryingRackController;

Route::get('/', [DryingRackController::class, 'index'])->name('home');
Route::post('/drying-rack/control', [DryingRackController::class, 'controlRack'])->name('drying-rack.control');
Route::post('/drying-rack/auto-mode', [DryingRackController::class, 'toggleAutoMode'])->name('drying-rack.auto-mode');
