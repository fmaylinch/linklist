
export function colorProgressiveFromScore(score: number) {
    // Higher score is more green, lower score is more red.
    // When the score is in the middle, it will be a bit blue.
    const greenWeight = score * 200 / 100;
    const redWeight = 200 - greenWeight;
    let blueWeight = 100 - Math.abs(50 - score);
    if (40 < score && score < 80) {
        blueWeight += 50;
    }
    return `rgb(${redWeight}, ${greenWeight}, ${blueWeight})`;
}

export function colorFromScore(score: number) {
    if (score == 0) return "#414646";
    if (score < 10) return "#c71616";
    if (score < 20) return "#9a0606";
    if (score < 30) return "#a64b24";
    if (score < 40) return "#985e07";
    if (score < 50) return "#989316";
    if (score < 60) return "#9876aa";
    if (score < 70) return "#7293b9";
    if (score < 80) return "#1aacc5";
    if (score < 90) return "#11c28d";
    return "#11a934";
}

