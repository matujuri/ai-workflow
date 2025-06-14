export const formatDateWithDay = (): string => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
    };
    return new Intl.DateTimeFormat('ja-JP', options).format(date);
}; 