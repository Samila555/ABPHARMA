import { useState } from 'react';
import { getImageUrl } from '../lib/api';

export default function MedicineImage({ src, name, className = '', style = {}, fallbackSize = 80 }) {
    const [errored, setErrored] = useState(false);
    const url = getImageUrl(src);

    if (!url || errored) {
        return (
            <div
                className={className}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
                    color: '#0369a1', fontWeight: 900,
                    fontSize: fallbackSize * 0.4,
                    ...style,
                }}
            >
                {name?.charAt(0) || '?'}
            </div>
        );
    }

    return (
        <img
            src={url}
            alt={name || ''}
            className={className}
            style={style}
            onError={() => setErrored(true)}
        />
    );
}
