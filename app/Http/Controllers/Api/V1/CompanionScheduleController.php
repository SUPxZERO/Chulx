<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateScheduleRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

final class CompanionScheduleController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user();
        $schedules = $user->companionSchedules()->orderBy('day_of_week')->orderBy('start_time')->get();
        return response()->json($schedules);
    }

    public function update(UpdateScheduleRequest $request): JsonResponse
    {
        $user = $request->user();
        $schedulesData = $request->validated('schedules');

        DB::transaction(function () use ($user, $schedulesData) {
            // Bulk replace strategy: delete old schedule, insert new
            $user->companionSchedules()->delete();

            $insertData = array_map(function ($schedule) use ($user) {
                return [
                    'companion_id' => $user->id,
                    'day_of_week'  => $schedule['day_of_week'],
                    'start_time'   => $schedule['start_time'],
                    'end_time'     => $schedule['end_time'],
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ];
            }, $schedulesData);

            $user->companionSchedules()->insert($insertData);
        });

        return response()->json([
            'message' => 'Weekly schedule updated successfully.',
            'data'    => $user->companionSchedules()->orderBy('day_of_week')->orderBy('start_time')->get()
        ]);
    }
}
