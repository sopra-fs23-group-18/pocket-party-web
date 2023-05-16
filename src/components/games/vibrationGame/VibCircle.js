import { forwardRef, useImperativeHandle, useState } from 'react';
import '../../../styles/games/VibCircle.scss'


export const VibCircle = forwardRef((props, ref) => {

    const [playing, setPlaying] = useState(false);

    useImperativeHandle(ref, () => ({
        play() {
            setPlaying(true)
        }
    }));


    return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <svg>
                <circle className={playing ? 'circle play' : 'circle'}>

                </circle>
            </svg>
        </div>
    )

});