import React, {useState} from "react";
import styled from "styled-components";
import tw from "twin.macro";
import { css } from "styled-components/macro"; //eslint-disable-line
//import HeaderBase, { NavLinks, NavLink, PrimaryLink } from "../headers/light.js";
import { SectionHeading } from "../misc/Headings.js";
import { SectionDescription } from "../misc/Typography.js";
import { PrimaryButton as PrimaryButtonBase } from "../misc/Buttons.js";
import { Container, ContentWithVerticalPadding } from "../misc/Layouts.js";
import { ReactComponent as CheckboxIcon } from "feather-icons/dist/icons/check-circle.svg";
import { ReactComponent as QuotesLeftIconBase } from "../../images/quotes-l.svg"
import { ReactComponent as SvgDecoratorBlob1 } from "../../images/dot-pattern.svg"

import { useLocation, useHistory } from "react-router-dom";
//const Header = tw(HeaderBase)`max-w-none`;
const TRow = tw.div`flex flex-col lg:flex-row justify-between items-center lg:pt-16 max-w-screen-2xl mx-auto sm:px-8`;
const TColumn = tw.div``;
const TextColumn = tw(TColumn)`mr-auto lg:mr-0 max-w-lg lg:max-w-xl xl:max-w-2xl`;
const Heading = tw(SectionHeading)`text-left text-primary-900 leading-snug xl:text-6xl`;
const Description = tw(SectionDescription)`mt-4 lg:text-base text-gray-700 max-w-lg`;
const PrimaryButton = tw(PrimaryButtonBase)`mt-8 inline-block w-56 tracking-wide text-center py-5`;
const FeatureList = tw.ul`mt-12 leading-loose`;
const Feature = tw.li`flex items-center`;
const FeatureIcon = tw(CheckboxIcon)`w-5 h-5 text-primary-500`;
const FeatureText = tw.p`ml-2 font-medium text-gray-700`;
const ImageColumn = tw(TColumn)`ml-auto lg:mr-0 relative mt-16 lg:mt-0 lg:ml-32`;
const ImageContainer = tw.div`relative z-40 transform xl:-translate-x-24 xl:-translate-y-16`;
const Image = tw.img`max-w-full w-96 rounded-t sm:rounded relative z-20`;
const Offsetbackground = tw.div`absolute inset-0 bg-gray-300 rounded xl:-mb-8`
const ImageDecoratorBlob = styled(SvgDecoratorBlob1)`
  ${tw`pointer-events-none z-10 absolute right-0 bottom-0 transform translate-x-10 translate-y-10 h-32 w-32 opacity-25 text-gray-900 fill-current`}
`;
const Testimonial = tw.div`max-w-sm rounded-b md:rounded-none relative sm:absolute bottom-0 inset-x-0 z-20 px-8 py-6 sm:px-10 sm:py-8 bg-primary-900 text-gray-400 font-medium transform md:-translate-x-32 text-sm leading-relaxed md:-mr-16 xl:mr-0`
const QuotesLeftIcon = tw(QuotesLeftIconBase)`w-16 h-16 md:w-12 md:h-12 absolute top-0 left-0 text-gray-100 md:text-red-500 transform translate-x-1 md:-translate-x-1/2 md:-translate-y-5 opacity-10 md:opacity-100`
const Quote = tw.blockquote``
const CustomerName = tw.p`mt-4 font-bold`
const CustomerCompany = tw.p`mt-1 text-sm text-gray-500`




export function TwoColumnWithFeaturesAndTestimonial({
  heading = "Non-Fungible Proof",
  description = "Keep your NFTs safe. Prove Ownership from any wallet.",
  imageSrc = "https://ipfs.io/ipfs/QmTyCm5EmNyPiFec9e61t7KbNNnFDLjZJhwo2fHifPC5R7",
  imageDecoratorBlob = true,
  primaryButtonUrl = "/searchnft",
  primaryButtonText = "Enter App",
  buttonRounded = true,
  features = ["Protects your assets", "On-Chain Ownership Verification", "Safe, Secure, and Easy"],
  testimonial = {
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    customerName: "Charlotte Hale",
    customerCompany: "Delos Inc."
  }
}) {
  let history = useHistory()
  const buttonRoundedCss = buttonRounded && tw`rounded-full`;

  const handleEnter = () => {
      if (window.confirm(`By Using/Entering the app you are agreeing to our Terms & Conditions and Privacy Policy. You can find this on the bottom of each page.`)) {
        history.push('/searchnft')
      }
  }

  /*const navLinks = [
    <NavLinks key={1}>
      <NavLink href="/#">About</NavLink>
      <NavLink href="/#">Blog</NavLink>
      <NavLink href="/#">Pricing</NavLink>
      <NavLink href="/#">Contact Us</NavLink>
      <NavLink href="/#">Testimonials</NavLink>
    </NavLinks>,
    <NavLinks key={2}>
      <NavLink href="/#" tw="lg:ml-12!">
        Login
      </NavLink>
      <PrimaryLink css={buttonRoundedCss} href="/#">
        Sign Up
      </PrimaryLink>
    </NavLinks>*
  ];*/
  //<PrimaryButton as="a" href={primaryButtonUrl} css={buttonRoundedCss} ></PrimaryButton>
  return (
    <>
      <Container>
      <ContentWithVerticalPadding>
          <TRow>
            <TextColumn>
              <Heading>{heading}</Heading>
              <Description>{description}</Description>
              <PrimaryButton css={buttonRoundedCss} onClick={handleEnter}>
                {primaryButtonText}
              </PrimaryButton>
              <FeatureList>
                {features.map((feature, index) => (
                  <Feature key={index}>
                    <FeatureIcon />
                    <FeatureText>{feature}</FeatureText>
                  </Feature>
                ))}
              </FeatureList>
            </TextColumn>
            <ImageColumn>
              <ImageContainer>
                <Image src={imageSrc} />
                {imageDecoratorBlob && <ImageDecoratorBlob />}
              </ImageContainer>
              <Offsetbackground />
            </ImageColumn>
          </TRow>
        </ContentWithVerticalPadding>
      </Container>
    </>
  );
};
