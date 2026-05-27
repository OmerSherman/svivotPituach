function attraction_card(attraction){

    return(
        <div className="attraction_card">
            <h2 className="attraction_card_header">{attraction.name_he}</h2>
            <p className="attraction_card_tags">{attraction.tags}</p>
            <p className="attraction_card_description_HE">{attraction.description_he}</p>
            <img src={attraction.image_url} alt={attraction.name_he}></img>
        </div>

    )
}

export default attraction_card;
