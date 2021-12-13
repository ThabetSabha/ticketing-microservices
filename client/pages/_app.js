import "bootstrap/dist/css/bootstrap.css";
import axiosClientBuilder from "../api/axiosClientBuilder";
import Header from "../components/header";

const AppComponent = ({ Component, pageProps, currentUser }) => {
    return (
        <div>
            <Header currentUser={currentUser} />
            <div className="container">
                <Component currentUser={currentUser} {...pageProps} />
            </div>
        </div>
    );
};

AppComponent.getInitialProps = async ({ Component, ctx }) => {
    const axiosClient = axiosClientBuilder(ctx);
    const { data } = await axiosClient.get("/api/users/currentuser");

    let pageProps = {};
    if (Component.getInitialProps) {
        pageProps = await Component.getInitialProps(
            ctx,
            axiosClient,
            data.currentUser
        );
    }

    return {
        pageProps,
        ...data,
    };
};

export default AppComponent;
