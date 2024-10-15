import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import { InView } from "react-intersection-observer";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Image } from "src/core/components/image/image.comp";
import { useAppDispatch } from "src/core/hook";
import { RootState } from "src/redux/create-store";
import "./home.comp.scss";
import HomeReducer, { fetchProducts } from "./home.redux";

const Home = (props: HomeProps) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchProducts());
  }, []);

  const pageData = props.pageData;

  const TopProducts = React.lazy(
    () => import(/* webpackChunkName: "top-products" */ "./components/top-products.comp"),
  );

  return (
    <>
      <Helmet>
        <title>{pageData.seo?.title || "My Title"}</title>
        <body className="my-class" />
      </Helmet>
      <h1>Home Page123</h1>
      <div className="d-flex flex-row flex-wrap min-vh-100" data-test-id="home-page">
        {pageData.products.map((product, idx) => {
          return (
            <div
              className={`card productCard`}
              key={idx}
              data-test-id={`product-card-${product.id}`}
            >
              <Image src={product.image} className="card-img-top" alt="..." />
              <div className="card-body">
                <h5 className="card-title">{product.title}</h5>
                <p className="card-text">{product.description}</p>
                <Link
                  to={`/product/detail/${product.id}`}
                  className="btn btn-primary"
                  data-test-id={`home-view-btn-${product.id}`}
                >
                  View
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      {/* test code for InView */}
      <InView triggerOnce={true}>
        {({ inView, ref }) => (
          <div ref={ref}>
            {inView ? (
              <TopProducts />
            ) : (
              <div className="d-flex flex-row flex-wrap">
                {[1, 2, 3].map((val) => (
                  <div className="productCard skeleton" key={val}></div>
                ))}
              </div>
            )}
          </div>
        )}
      </InView>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    pageData: state.home.pageData,
  };
};
export default connect(mapStateToProps, {})(Home);

export interface HomeProps extends ReturnType<typeof mapStateToProps> {}

export const reducer = {
  home: HomeReducer,
};
