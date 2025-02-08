import cron from 'node-cron';

export function startScheduler(intervalMinutes: number, durationHours: number, callback: () => void): void {
	const task = cron.schedule(`*/${intervalMinutes} * * * *`, async () => {
		console.log(`Running sequence at ${new Date().toLocaleTimeString()}`);
		callback();
	});

	// Stop the scheduler after the specified duration
	setTimeout(() => {
		task.stop();
		console.log('Scheduler stopped after the specified duration.');
	}, durationHours * 60 * 60 * 1000); // Convert hours to milliseconds
}
