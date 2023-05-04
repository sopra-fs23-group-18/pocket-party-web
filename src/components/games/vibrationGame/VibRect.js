import { forwardRef, useImperativeHandle, useState } from 'react';
import '../../../styles/games/vibRect.scss'


export const VibRect = forwardRef((props, ref) => {

    const [playing, setPlaying] = useState(false);

    useImperativeHandle(ref, () => ({
        play() {
            setPlaying(true)
        }
    }));


    return(
        <svg >
            <rect className={playing ? 'rect play' : 'rect'}>

            </rect>
        </svg>
    )

});