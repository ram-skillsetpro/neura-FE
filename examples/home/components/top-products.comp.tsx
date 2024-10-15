import { Image } from "core/components/image/image.comp";
import { useEffect } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { useAppDispatch } from "src/core/hook";
import { RootState } from "src/redux/create-store";
import { fetchTopProducts } from "../home.redux";

const TopProducts = (props: TopProductsProps) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchTopProducts());
  }, []);

  return (
    <>
      <h1>Top Products</h1>
      <div className="d-flex flex-row flex-wrap" data-test-id="top-products">
        {props.topProducts.map((product, idx) => {
          return (
            <div className={`card productCard`} key={idx}>
              <Image src={product.image} className="card-img-top" alt="..." />
              <div className="card-body">
                <h5 className="card-title">{product.title}</h5>
                <p className="card-text">{product.description}</p>
                <Link to={`/product/detail/${product.id}`} className="btn btn-primary">
                  View
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export interface TopProductsProps extends ReturnType<typeof mapStateToProps> {}
const mapStateToProps = (state: RootState) => {
  return {
    topProducts: state.home.topProducts,
  };
};
const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(TopProducts);

