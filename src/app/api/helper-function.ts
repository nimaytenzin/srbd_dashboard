export function PARSEDATE(date: string) {
    const dateObject = new Date(date);

    // Format the Date object to a human-readable string
    return dateObject.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    });
}
