function selectRecommendedSeat(seatNumber) {

    const seats = document.querySelectorAll(".seat");

    for (const seat of seats) {

        if (
            parseInt(seat.innerText) === seatNumber &&
            !seat.classList.contains("occupied")
        ) {

            seat.click();
            return true;

        }

    }

    return false;

}

export default selectRecommendedSeat;
