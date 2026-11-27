import { SwitchProps } from '@mui/material'
import React from 'react'

export type Props = IconSwitchBaseProps;

type IconSwitchBaseProps = Omit<SwitchProps, 'icon' | 'checkedIcon'> & {
    uncheckedIcon?: React.ReactElement;
    checkedIcon?: React.ReactElement;
};
