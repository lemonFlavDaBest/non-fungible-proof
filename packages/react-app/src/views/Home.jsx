import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import React from "react";
import tw from "twin.macro";
import { Link } from "react-router-dom";
import {TwoColumnWithFeaturesAndTestimonial as Hero} from "../components/hero/TwoColumnWithFeaturesAndTestimonial.jsx"
import {ThreeColWithSideImage as Feature} from "../components/features/ThreeColWithSideImage.jsx"
import {DashedBorderSixFeatures as DashedBordersFeature} from "../components/features/DashedBorderSixFeatures.jsx"
import AnimationRevealPage from "../helpers/AnimationRevealPage"
import GlobalStyles from "../styles/GlobalStyles"
import {SimpleWithSideImage} from "../components/faqs/SimpleWithSideImage.jsx";
import {SingleCol as FAQ} from "../components/faqs/SingleCol.jsx"

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home({ yourLocalBalance, readContracts }) {
  const Subheading = tw.span`uppercase tracking-widest font-bold text-primary-500`;
  const HighlightedText = tw.span`text-primary-500`;
  return (
    <>
    
      <AnimationRevealPage disabled>
        <Hero />
        <Feature heading = {<>Amazing Features</>} 
        description = {<>Easy to use and understand. 
        Our NFP (Proof of Ownership) tokens can easily be implemented into your project today.</>} /> 
        <DashedBordersFeature />
        <SimpleWithSideImage />
        <FAQ
        subheading={<Subheading>FAQS</Subheading>}
        heading={
          <>
            You have <HighlightedText>Questions ?</HighlightedText>
          </>
        }
        faqs={[
          {
            question: "Is the NFP Token an NFT ?",
            answer:
              "Yes. it is an NFT Token that is used to prove ownership over an NFT from another wallet. Think of it as soulbound token that can grant ownership privileges to  a separate wallet."
          },
          {
            question: "Can I lose my NFT ?",
            answer:
              "There is always risk, but probably not. The contract does not interact with or give permissions for your NFT. It only checks if you own it."
          },
          {
            question: "What happens to an NFP Token if the original NFT is sold or transferred?",
            answer:
            "An NFP token proves ownership over an NFT. If that NFT is ever transferred or sold, the NFP token will be marked as invalid and can be burned by the real owner. "
          },
          {
            question: "Can I implement this with my project ?",
            answer:
            "Yes and it is so so easy. A couple lines of code (we'll give you), and it's ready for your next event or airdrop. LFB!"
          },
          {
            question: "Is it free ?",
            answer:
              "Unfortunately, no. However all you need to pay is a small mint fee (.001 ETH or 1 $APE). "
          },
          
          {
            question: "I want to use this in my project but I don't want to make everyone mint an NFP Token. ",
            answer:
              "It is totally fine if some members do or do not want to mint an NFP Token. Our app and contracts check for valid NFP Tokens and Owners, so there is no chance of fraud, a missed airdrop, or a missed event. If you need help or more information about this, please reach out.  "
          },
        ]}
      />
      </AnimationRevealPage>
    </>
  );
}

export default Home;
