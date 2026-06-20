import { useState } from "react";
import "./ItemCard.css";

function ItemCard(props) {
    const isClickable = typeof props.onClick === "function";
    const [imgFailed, setImgFailed] = useState(false);

    function handleClick() {
        if (isClickable) {
            props.onClick();
        }
    }

    const showImage = props.imageUrl && !imgFailed;

    return (
        <article
            className={"item-card" + (isClickable ? " item-card-clickable" : "")}
            onClick={handleClick}
        >
            <div className="item-card-image">
                {showImage ? (
                    <img
                        src={props.imageUrl}
                        alt={props.title}
                        loading="lazy"
                        onError={function() { setImgFailed(true); }}
                    />
                ) : (
                    <div className="item-card-placeholder">🌎</div>
                )}

                {props.badge && (
                    <span className="item-card-badge">{props.badge}</span>
                )}

                {props.score !== undefined && props.score !== null && (
                    <span className="item-card-score">{props.score}</span>
                )}
            </div>

            <div className="item-card-body">
                <h3 className="item-card-title">{props.title}</h3>

                {props.subtitle && (
                    <p className="item-card-subtitle">{props.subtitle}</p>
                )}

                {props.description && (
                    <p className="item-card-description">{props.description}</p>
                )}

                {props.scoreHint && (
                    <p className="item-card-score-hint" title="לחץ לפירוט מלא">💡 {props.scoreHint}</p>
                )}

                {props.tags && props.tags.length > 0 && (
                    <div className="item-card-tags">
                        {props.tags.slice(0, 5).map(function(tag, index) {
                            return <span key={index} className="item-card-tag">{tag}</span>;
                        })}
                    </div>
                )}
            </div>
        </article>
    );
}

export default ItemCard;
