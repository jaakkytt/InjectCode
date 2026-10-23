import React from 'react'
import { SwitchProps } from '@mui/material'

type IconSwitchBaseProps = Omit<SwitchProps, 'icon' | 'checkedIcon'> & {
    uncheckedIcon?: React.ReactElement;
    checkedIcon?: React.ReactElement;
};

export type Props = IconSwitchBaseProps;
