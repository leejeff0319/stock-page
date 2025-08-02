import AuthForm from '@/components/AuthForm'
import React from 'react'

const LogIn = () => {
    return (
        <section className="flex-center size-full
        max-sm:px-6">
            <AuthForm type="log-in" />
        </section>
    )
}

export default LogIn