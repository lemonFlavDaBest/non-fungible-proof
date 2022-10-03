import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import React from "react";
import { Link } from "react-router-dom";
import {TwoColumnWithFeaturesAndTestimonial as Hero} from "../components/hero/TwoColumnWithFeaturesAndTestimonial"
import AnimationRevealPage from "../helpers/AnimationRevealPage"
import GlobalStyles from "../styles/GlobalStyles"

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home({ yourLocalBalance, readContracts }) {

  return (
    <>
    
      <AnimationRevealPage disabled>
        <Hero />
      </AnimationRevealPage>
    </>
  );
}

export default Home;
