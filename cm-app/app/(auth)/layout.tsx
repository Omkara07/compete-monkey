const AuthLayout = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return (
        <div className="flex justify-center h-full py-12 items-center">
            {children}
        </div>
    );
}

export default AuthLayout;