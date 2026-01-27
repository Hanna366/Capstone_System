<?php $__env->startSection('content'); ?>
<div class="min-h-screen bg-background p-4 md:p-6 lg:p-8" x-data="dryingRack()" x-init="init()">
    <div class="max-w-6xl mx-auto space-y-6">
        <!-- Header -->
        <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="space-y-2">
                <h1 class="text-3xl md:text-4xl font-bold text-primary">Smart Drying Rack</h1>
                <p class="text-muted-foreground">
                    Solar-powered IoT drying solution with weather monitoring
                </p>
            </div>
            <div>
                <button 
                    @click="showSettings = !showSettings"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Settings
                </button>
            </div>
        </header>

        <!-- Connection Status -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2">
                <div class="rounded-xl border-2 p-4 <?php echo e($deviceData->connected ? 'bg-success/10 border-success/30 text-success' : 'bg-warning/10 border-warning/30 text-warning-foreground'); ?>">
                    <div class="flex items-start gap-3">
                        <svg class="h-5 w-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <h3 class="font-semibold mb-1"><?php echo e($deviceData->connected ? 'Connected to System' : 'Disconnected'); ?></h3>
                            <p class="text-sm opacity-90"><?php echo e($deviceData->connected ? 'Live data streaming from IoT device' : 'No connection to IoT device'); ?></p>
                            <?php if($deviceData->connected): ?>
                                <p class="text-xs opacity-75 mt-1">
                                    Powered by ESP32 microcontroller with Wi-Fi connectivity
                                </p>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div class="p-4 border-2 bg-card rounded-lg">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="p-2 rounded-full <?php echo e($deviceData->connected ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'); ?>">
                                <?php if($deviceData->connected): ?>
                                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                                    </svg>
                                <?php else: ?>
                                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                                    </svg>
                                <?php endif; ?>
                            </div>
                            <div>
                                <h3 class="font-semibold text-card-foreground">System Connection</h3>
                                <p class="text-sm text-muted-foreground">
                                    <?php echo e($deviceData->connected ? 'Connected to ESP32 IoT device' : 'Disconnected from ESP32 IoT device'); ?>

                                </p>
                                <?php if($deviceData->connected): ?>
                                    <p class="text-xs text-muted-foreground mt-1">
                                        Data from DHT22, YL-83 sensors and L298N motor controller
                                    </p>
                                <?php endif; ?>
                            </div>
                        </div>
                        
                        <span class="px-2 py-1 text-xs rounded-full <?php echo e($deviceData->connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'); ?>">
                            <?php echo e($deviceData->connected ? 'Online' : 'Offline'); ?>

                        </span>
                    </div>
                    
                    <div class="mt-3 flex items-center gap-4 text-sm">
                        <div class="flex items-center gap-1 text-muted-foreground">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>IoT System</span>
                        </div>
                        
                        <div class="flex items-center gap-1 text-muted-foreground">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Last update: <?php echo e($deviceData->lastUpdate->format('H:i:s')); ?></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Solar Power & Weather Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Solar Power Card -->
            <div class="p-6 border-2 rounded-lg">
                <div class="flex items-center gap-2 mb-4">
                    <svg class="h-5 w-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <h2 class="text-xl font-bold">Solar Power</h2>
                </div>
                <p class="text-sm text-gray-600 mb-4">
                    Powered by 12V/10W solar panel with charge controller and 12V battery pack
                </p>

                <div class="space-y-4">
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm text-gray-600">Battery Level</span>
                            <span class="font-semibold"><?php echo e($deviceData->batteryLevel); ?>%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                class="bg-green-600 h-2 rounded-full transition-all duration-300" 
                                style="width: <?php echo e($deviceData->batteryLevel); ?>%"
                            ></div>
                        </div>
                    </div>

                    <div class="flex items-center justify-between pt-2">
                        <div class="flex items-center gap-2">
                            <svg class="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span class="text-sm font-medium text-green-600">
                                <?php echo e($deviceData->isCharging ? 'Charging' : 'Idle'); ?>

                            </span>
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-bold text-yellow-500"><?php echo e(number_format($deviceData->currentOutput, 2)); ?>W</div>
                            <div class="text-xs text-gray-600">Current Output</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Weather Card -->
            <div class="p-6 border-2 rounded-lg">
                <div class="flex items-center gap-2 mb-4">
                    <svg class="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                    <h2 class="text-xl font-bold">Weather Conditions</h2>
                </div>
                <p class="text-sm text-gray-600 mb-4">
                    Data collected via DHT22 sensor and processed by ESP32 microcontroller
                </p>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <div class="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <svg class="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>Temperature</span>
                        </div>
                        <div class="text-3xl font-bold"><?php echo e($deviceData->temperature); ?>°C</div>
                    </div>

                    <div>
                        <div class="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <svg class="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                            </svg>
                            <span>Humidity</span>
                        </div>
                        <div class="text-3xl font-bold"><?php echo e($deviceData->humidity); ?>%</div>
                    </div>

                    <div>
                        <div class="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <svg class="h-4 w-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span>UV Index</span>
                        </div>
                        <div class="text-3xl font-bold"><?php echo e($deviceData->uvIndex); ?></div>
                    </div>

                    <div>
                        <div class="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <svg class="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Wind Speed</span>
                        </div>
                        <div class="text-3xl font-bold"><?php echo e($deviceData->windSpeed); ?> km/h</div>
                    </div>
                </div>
            </div>

            <!-- Weather Analysis Card -->
            <div class="p-6 border-2 rounded-lg">
                <div class="flex items-center gap-2 mb-4">
                    <svg class="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <h2 class="text-xl font-bold">Weather Analysis</h2>
                </div>
                <p class="text-sm text-gray-600 mb-4">
                    Real-time analysis using ESP32 with DHT22 and rain sensor (YL-83) integration
                </p>

                <div class="space-y-4">
                    <div class="p-4 rounded-lg bg-gray-100">
                        <div class="text-center">
                            <div class="<?php echo e(getComfortClass($deviceData)); ?> text-2xl font-bold"><?php echo e(getComfortLevel($deviceData)['level']); ?></div>
                            <div class="text-sm text-gray-600"><?php echo e(getComfortLevel($deviceData)['description']); ?></div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div class="flex items-center gap-2">
                                <svg class="h-4 w-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span class="text-sm text-gray-600">Feels Like</span>
                            </div>
                            <div class="text-sm font-medium"><?php echo e(round($deviceData->temperature + ($deviceData->humidity > 70 ? 2 : 0) + ($deviceData->windSpeed > 15 ? -1 : 0))); ?>°C</div>
                        </div>

                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div class="flex items-center gap-2">
                                <svg class="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                </svg>
                                <span class="text-sm text-gray-600">Dew Point</span>
                            </div>
                            <div class="text-sm font-medium"><?php echo e(round($deviceData->temperature - (100 - $deviceData->humidity) / 5)); ?>°C</div>
                        </div>
                    </div>

                    <div>
                        <h3 class="font-medium mb-2">Recommendations:</h3>
                        <ul class="space-y-1">
                            <?php $__currentLoopData = getRecommendations($deviceData); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $recommendation): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                <li class="text-sm text-gray-600 flex items-start">
                                    <span class="mr-2">•</span> <?php echo e($recommendation); ?>

                                </li>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Rack Control Card -->
        <div class="p-6 border-2 bg-white rounded-lg">
            <div class="flex items-center gap-2 mb-6">
                <svg class="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <h2 class="text-xl font-bold">Rack Control</h2>
            </div>

            <div class="space-y-6">
                <div class="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                    <span class="font-medium">Auto Mode</span>
                    <form action="<?php echo e(route('drying-rack.auto-mode')); ?>" method="POST" class="inline">
                        <?php echo csrf_field(); ?>
                        <input type="hidden" name="enabled" value="<?php echo e($deviceData->autoMode ? '0' : '1'); ?>">
                        <button 
                            type="submit"
                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors <?php echo e($deviceData->autoMode ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 hover:bg-gray-400'); ?>"
                        >
                            <span 
                                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform <?php echo e($deviceData->autoMode ? 'translate-x-6' : 'translate-x-1'); ?>"
                            ></span>
                        </button>
                    </form>
                </div>

                <p class="text-sm text-gray-600">
                    Controlled by ESP32 microcontroller via L298N motor driver and DC gear motor
                </p>

                <div>
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-sm text-gray-600">Current Position</span>
                        <span class="font-semibold capitalize"><?php echo e($deviceData->rackPosition); ?></span>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <form action="<?php echo e(route('drying-rack.control')); ?>" method="POST">
                            <?php echo csrf_field(); ?>
                            <input type="hidden" name="action" value="extend">
                            <button
                                type="submit"
                                <?php echo e($deviceData->rackPosition === 'extended' ? 'disabled' : ''); ?>

                                class="w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center <?php echo e($deviceData->rackPosition === 'extended' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'); ?>"
                            >
                                <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                                </svg>
                                Extend
                            </button>
                        </form>
                        <form action="<?php echo e(route('drying-rack.control')); ?>" method="POST">
                            <?php echo csrf_field(); ?>
                            <input type="hidden" name="action" value="retract">
                            <button
                                type="submit"
                                <?php echo e($deviceData->rackPosition === 'retracted' ? 'disabled' : ''); ?>

                                class="w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center <?php echo e($deviceData->rackPosition === 'retracted' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'); ?>"
                            >
                                <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                                Retract
                            </button>
                        </form>
                    </div>
                </div>

                <?php if($deviceData->autoMode): ?>
                    <div class="flex items-start gap-2 p-3 bg-green-100 border border-green-300 rounded-lg">
                        <svg class="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <p class="text-sm text-green-700">
                            Auto mode active - Rack adjusts based on weather conditions
                        </p>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('alpine:init', () => {
    Alpine.data('dryingRack', () => ({
        showSettings: false,
        
        init() {
            // Auto-refresh data every 5 seconds
            setInterval(() => {
                window.location.reload();
            }, 5000);
        }
    }));
});
</script>
<?php $__env->stopSection(); ?>
<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Smart\Helioxis_Capstone_System\resources\views/drying-rack/index.blade.php ENDPATH**/ ?>