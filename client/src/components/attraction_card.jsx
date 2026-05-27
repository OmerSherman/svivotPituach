//  {
//     "id": 1,
//     "city_id": 2,
//     "name": "La Boca & Caminito",
//     "name_he": "לה בוקה וקמיניטו",
//     "type": "site",
//     "tags": ["תרבות", "אמנות", "צילום", "טנגו"],
//     "description_he": "שכונת הנמל הצבעונית של בואנוס איירס, עם רחוב קמיניטו המפורסם ובתים צבעוניים בגוונים עזים. ריקודי טנגו ברחוב ודוכני אמנים.",
//     "image_url": "",
//     "popularity_score": 91,
//     "audience_scores": { "family": 80, "couple": 88, "solo": 85, "group": 90 },
//     "best_months": [3, 4, 5, 9, 10, 11],
//     "avoid_months": [1, 2],
//     "seasonal_note_he": "הקיץ הארגנטינאי (ינואר-פברואר) חם מאוד. מומלץ להגיע באביב או סתיו.",
//     "source_article_ids": [1, 2],
//     "latitude": -34.6345,
//     "longitude": -58.3631
//   }


function attraction_card(attraction){

    return(
        <div class="attraction_card">
            <h2 class="attraction_card_header">{attraction.name_he}</h2>
            <p class="attraction_card_tags">{attraction.tags}</p>
            <p class="attraction_card_description_HE">{attraction.description_he}</p>
            <img url={attraction.image_url}></img>
        </div>

    )
}

export default attraction_card