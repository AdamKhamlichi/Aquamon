/* eslint-disable react-refresh/only-export-components */
// File: src/hooks/use-button-sfx.tsx
import { useAudio } from '@/hooks/use-audio';
import { Button } from '@/components/ui/button';
import * as React from 'react';

// Main hook for button sound effects
export const useButtonSfx = () => {
    const { playSound } = useAudio();

    const playSfx = React.useCallback((type: 'click' | 'hover' = 'click') => {
        if (type === 'click') {
            playSound('/sounds/button-click.mp3');
        } else if (type === 'hover') {
            playSound('/sounds/button-hover.mp3');
        }
    }, [playSound]);

    return playSfx;
};

// ButtonWithSfx component that automatically handles sound effects
export const ButtonWithSfx = React.forwardRef<
    HTMLButtonElement,
    React.ComponentPropsWithoutRef<typeof Button>
>(({ onMouseEnter, onClick, ...props }, ref) => {
    const playSfx = useButtonSfx();

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
        playSfx('hover');
        onMouseEnter?.(e);
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        playSfx('click');
        onClick?.(e);
    };

    return (
        <Button
            ref={ref}
            onMouseEnter={handleMouseEnter}
            onClick={handleClick}
            {...props}
        />
    );
});
ButtonWithSfx.displayName = 'ButtonWithSfx';