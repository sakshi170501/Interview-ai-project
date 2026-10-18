import { createContext, useState } from "react";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setloading] = useState(true);

 
    return (
        <AuthContext.Provider
            value={{ user, setUser, loading, setloading }}
        >
            {children}
        </AuthContext.Provider>
    );
};