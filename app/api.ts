export const fetchChartConfig = async (chartId: string) => {
    return await fetch(`/api/config/${chartId}`).then((result) =>
        result.json()
    );
}