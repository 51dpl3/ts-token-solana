import { TokenStandard, createAndMint, createFungible, createV1, mintV1, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { generateSigner, keypairIdentity, percentAmount } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { userKeypair } from "./helpers";

const umi = createUmi('https://api.devnet.solana.com');
// Register our keypair to be used as the default signer
const keypair = umi.eddsa.createKeypairFromSecretKey(userKeypair.secretKey);

umi.use(keypairIdentity(keypair)).use(mplTokenMetadata())

// Uploading our asset metadata to centralised storage provider, i.e., uri
const metadata = {
    name: "Solana Gold",
    symbol: "GOLDSOL",
    uri: "https://raw.githubusercontent.com/solana-developers/program-examples/new-examples/tokens/tokens/.assets/spl-token.json",
};

const mint = generateSigner(umi);

/**
 * Creating the on-chain metadata account that will hold our asset data 
 * such as the off-chain URI, mint, symbol ...
 */

async function createMetadataDetails() {
    // Define the metadata and behaviour of token 
    await createV1(umi, {
        mint,
        authority: umi.identity,
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.uri,
        sellerFeeBasisPoints: percentAmount(0),
        decimals: 9,
        tokenStandard: TokenStandard.Fungible,  // declare our token as Fungible
    }).sendAndConfirm(umi)
}

/**
 * Mint token with the associated accounts
 */

async function mintToken() {
    await mintV1(umi, {
        mint: mint.publicKey,
        authority: umi.identity,
        amount: 10_000,
        tokenOwner: umi.identity.publicKey,
        tokenStandard: TokenStandard.Fungible,
    }).sendAndConfirm(umi)
}

createMetadataDetails().then(() => {
    createFungible(umi, {
      mint,
      authority: umi.identity,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      sellerFeeBasisPoints: percentAmount(0),
      decimals: 9,
    }).sendAndConfirm(umi).then(() => {
        mintToken();
  });
});
 
