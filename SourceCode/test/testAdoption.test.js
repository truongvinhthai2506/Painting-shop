const Adoption = artifacts.require("Adoption");

contract("Adoption", (accounts) => {
    let adoption;
    let expectedAdopter;

    before(async () => {
        adoption = await Adoption.deployed();
    });

    it("Can adopt a pet using first account address", async () => {
        await adoption.adopt(8, { from: accounts[0] });
        expectedAdopter = accounts[0];
    });

    it("Can fetch the address of an owner by pet id", async () => {
        const adopter = await adoption.adopters(8);
        assert.equal(adopter, expectedAdopter, "The owner of the adopted pet should be first account");
    });

    it("Can fetch the collection of all pet owners's addresses", async () => {
        const adopters = await adoption.getAdopters();
        assert.equal(adopters[8], expectedAdopter, "The owner of the adopted pet should be in the " + 
            "collection");
    });
});