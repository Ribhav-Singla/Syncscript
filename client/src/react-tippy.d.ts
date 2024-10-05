declare module 'react-tippy' {
    import { ComponentType } from 'react';

    export interface TooltipProps {
        title: string;
        position?: string;
        trigger?: string;
        animation?: string;
        className?: string;
        children: ReactNode;
    }

    export const Tooltip: ComponentType<TooltipProps>;
}
