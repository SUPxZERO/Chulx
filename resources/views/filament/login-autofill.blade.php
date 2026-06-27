<div class="mt-4">
    <div class="text-sm font-medium text-center text-gray-500 mb-2 dark:text-gray-400">
        Demo Login Auto-fill
    </div>
    <div class="flex flex-col gap-2">
        <x-filament::button
            color="primary"
            type="button"
            x-data
            x-on:click="$wire.set('data.email', 'admin@chulx.com'); $wire.set('data.password', 'password');"
        >
            Admin (admin@chulx.com)
        </x-filament::button>

        <x-filament::button
            color="success"
            type="button"
            x-data
            x-on:click="$wire.set('data.email', 'companion@chulx.com'); $wire.set('data.password', 'password');"
        >
            Companion (companion@chulx.com)
        </x-filament::button>

        <x-filament::button
            color="info"
            type="button"
            x-data
            x-on:click="$wire.set('data.email', 'client@chulx.com'); $wire.set('data.password', 'password');"
        >
            Client (client@chulx.com)
        </x-filament::button>
    </div>
</div>
