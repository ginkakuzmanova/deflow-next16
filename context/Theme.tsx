'use client'

import React from 'react'
import {ThemeProviderProps, ThemeProvider as NextThemeProvider} from "next-themes";

const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
    return (
        <NextThemeProvider {...props}>{children}</NextThemeProvider>
    )
}
export default ThemeProvider
