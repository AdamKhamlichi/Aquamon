/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/components/ui/interactive-element.tsx
import * as React from 'react';
import { useInteractionSound } from '@/hooks/use-interaction-sound';

interface InteractiveProps extends React.HTMLAttributes<HTMLDivElement> {
    as?: keyof JSX.IntrinsicElements | React.ComponentType<any>;
    soundOptions?: {
        onClick?: boolean;
        onHover?: boolean;
        clickSound?: string;
        hoverSound?: string;
    };
}

export const Interactive = React.forwardRef<HTMLDivElement, InteractiveProps>(({
    as: Component = 'div',
    soundOptions,
    onClick,
    onMouseEnter,
    ...props
}, ref) => {
    const { withSound } = useInteractionSound(soundOptions);

    return (
        <Component
            {...props}
            ref={ref}
            onClick={withSound(onClick, 'click')}
            onMouseEnter={withSound(onMouseEnter, 'hover')}
        />
    );
});

Interactive.displayName = 'Interactive';