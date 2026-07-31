class SeatRecommender {

    recommend(bookedSeats) {

        const preferredSeats = [
            1,2,5,6,
            9,10,
            13,14,
            17,18
        ];

        for (const seat of preferredSeats) {

            if (!bookedSeats.includes(seat)) {

                return seat;

            }

        }

        return null;

    }

}

export default new SeatRecommender();
