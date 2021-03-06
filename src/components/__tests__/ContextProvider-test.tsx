import * as React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";

import ContextProvider from "../ContextProvider";
import buildStore from "opds-web-client/lib/store";

class TestComponent extends React.Component<any, any> {}

describe("ContextProvider", () => {
  let wrapper;
  let store;
  let homeUrl = "http://example.com/home";
  let catalogBase = "http://example.com";
  let catalogName = "Example";
  let appName = "Example App";
  let authPlugins = [{
    type: "test",
    lookForCredentials: () => {},
    formComponent: null,
    buttonComponent: null
  }];
  let headerLinks = [{
    title: "FAQ",
    url: "http://faq"
  }];
  let logoLink = "http://home";
  let shortenUrls = true;

  beforeEach(() => {
    store = buildStore();
    wrapper = shallow(
      <ContextProvider
        homeUrl={homeUrl}
        catalogBase={catalogBase}
        catalogName={catalogName}
        appName={appName}
        authPlugins={authPlugins}
        headerLinks={headerLinks}
        logoLink={logoLink}
        shortenUrls={shortenUrls}
        initialState={store.getState()}>
        <TestComponent />
      </ContextProvider>
    );
  });

  it("provides child context", () => {
    let context = wrapper.instance().getChildContext();
    expect(context.pathFor).to.equal(wrapper.instance().pathFor);
    expect(context.homeUrl).to.equal(homeUrl);
    expect(context.catalogBase).to.equal(catalogBase);
    expect(context.catalogName).to.equal(catalogName);
    expect(context.appName).to.equal(appName);
    expect(context.authPlugins).to.deep.equal(authPlugins);
    expect(context.headerLinks).to.deep.equal(headerLinks);
    expect(context.logoLink).to.equal(logoLink);
    expect(context.initialState).to.equal(store.getState());
  });

  it("renders child", () => {
    let children = wrapper.find(TestComponent);
    expect(children.length).to.equal(1);
  });

  describe("pathFor with url shortening", () => {
    let collectionUrl = "collection/url";
    let bookUrl = "book/url";
    let host = "http://example.com";

    it("prepares collection url", () => {
      let url = host + "/groups/eng/Adult%20Fiction";
      expect(wrapper.instance().prepareCollectionUrl(url)).to.equal("groups%2Feng%2FAdult%2520Fiction");
    });

    it("prepares book url", () => {
      let url = host + "/NYPL/works/Axis%20360/Axis%20360%20ID/0016201449";
      expect(wrapper.instance().prepareBookUrl(url)).to.equal("NYPL%2FAxis%2520360%2FAxis%2520360%2520ID%2F0016201449");
    });

    it("returns a path with collection and book", () => {
      let instance = wrapper.instance();
      let path = instance.pathFor(collectionUrl, bookUrl);
      expect(path).to.equal(
        `/collection/${instance.prepareCollectionUrl(collectionUrl)}` +
        `/book/${instance.prepareBookUrl(bookUrl)}`
      );
    });

    it("returns a path with only collection", () => {
      let instance = wrapper.instance();
      let path = instance.pathFor(collectionUrl, null);
      expect(path).to.equal(`/collection/${instance.prepareCollectionUrl(collectionUrl)}`);
    });

    it("returns a path with only book", () => {
      let instance = wrapper.instance();
      let path = instance.pathFor(null, bookUrl);
      expect(path).to.equal(`/book/${instance.prepareBookUrl(bookUrl)}`);
    });

    it("returns a path with no collection or book", () => {
      let path = wrapper.instance().pathFor(null, null);
      expect(path).to.equal(``);
    });
  });

  describe("pathFor without url shortening", () => {
    let collectionUrl = "collection/url";
    let bookUrl = "book/url";
    let host = "http://example.com";

    beforeEach(() => {
      wrapper = shallow(
        <ContextProvider
          homeUrl={homeUrl}
          catalogBase={catalogBase}
          catalogName={catalogName}
          appName={appName}
          authPlugins={authPlugins}
          headerLinks={headerLinks}
          logoLink={logoLink}
          shortenUrls={false}
          initialState={store.getState()}>
          <TestComponent />
        </ContextProvider>
      );
    });

    it("encodes collection url", () => {
      let url = host + "/groups/eng/Adult%20Fiction";
      expect(wrapper.instance().prepareCollectionUrl(url)).to.equal(encodeURIComponent(url));
    });

    it("encodes book url", () => {
      let url = host + "/works/Axis%20360/Axis%20360%20ID/0016201449";
      expect(wrapper.instance().prepareBookUrl(url)).to.equal(encodeURIComponent(url));
    });
  });
});