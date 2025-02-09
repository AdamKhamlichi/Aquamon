/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/hooks/use-interaction-sound.tsx
import { useAudio } from '@/hooks/use-audio';
import * as React from 'react';

interface UseInteractionSoundProps {
    onClick?: boolean;
    onHover?: boolean;
    clickSound?: string;
    hoverSound?: string;
}

export const useInteractionSound = ({
    onClick = true,
    onHover = true,
    clickSound = '/sounds/button-click.mp3',
    hoverSound = '/sounds/button-hover.mp3'
}: UseInteractionSoundProps = {}) => {
    const { playSound } = useAudio();

    const handleClick = React.useCallback((e: React.MouseEvent<HTMLElement>) => {
        if (onClick) {
            playSound(clickSound);
        }
    }, [onClick, clickSound, playSound]);

    const handleMouseEnter = React.useCallback((e: React.MouseEvent<HTMLElement>) => {
        if (onHover) {
            playSound(hoverSound);
        }
    }, [onHover, hoverSound, playSound]);

    // Function to combine with existing event handlers
    const withSound = React.useCallback(<T extends (e: any) => void>(
        handler?: T,
        type: 'click' | 'hover' = 'click'
    ) => {
        return (e: Parameters<T>[0]) => {
            if (type === 'click') {
                handleClick(e);
            } else {
                handleMouseEnter(e);
            }
            handler?.(e);
        };
    }, [handleClick, handleMouseEnter]);

    return {
        handlers: {
            onClick: handleClick,
            onMouseEnter: handleMouseEnter
        },
        withSound
    };
};

// HOC to add sound to any component
export function withInteractionSound<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    options: UseInteractionSoundProps = {}
) {
    return React.forwardRef<any, P>((props, ref) => {
        const { handlers } = useInteractionSound(options);

        return (
            <WrappedComponent
                {...props}
                {...(props as P)}
                {...handlers}
                ref={ref}
            />
        );
    });
}