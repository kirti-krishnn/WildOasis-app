import styles from './FeaturesHeader.module.css';
import HtmlFeature from './HtmlFeature.jsx';

export default function FeaturesHeader({ title, buttonList, extraAction = null }) {
    return (
        <div className={styles.navbar}>
            <h2 className={styles.title}>{title}</h2>
            <div className={styles.actions}>
                {(buttonList || []).map((feature, index) => (
                    <HtmlFeature
                        feature={feature}
                        key={typeof feature === "string" ? feature : feature.title || feature.value || index}
                    />
                ))}
                {extraAction}
            </div>
        </div>
    );
}
