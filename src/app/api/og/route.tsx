import { DH_GRAPH_ENDPOINT } from '@/utils/constants';
import { postData } from '@/utils/helpers';
import { ImageResponse } from 'next/og';
// App router includes @vercel/og.
// No need to install it.

export async function GET(request: Request) {

  // https://dinhaus.github.io/din-blog/#/content/0xaa36a7/0x47bca1ea1c9785d0c030857ab7ba1d9648f45af2/0x09a0e2ce13ecf38fccd5160ed9cc40d7bd0ade606ab83894697a808ffdaf5852
  // /?chainId=0xaa36a7&daoId=0x47bca1ea1c9785d0c030857ab7ba1d9648f45af2&contentId=0x09a0e2ce13ecf38fccd5160ed9cc40d7bd0ade606ab83894697a808ffdaf5852
  try {
    const { searchParams } = new URL(request.url);
    const hasDaoId = searchParams.has('daoId');
    const hasChainId = searchParams.has('chainId');
    const hasContentId = searchParams.has('contentId');
    const daoId = hasDaoId
      ? searchParams.get('daoId')
      : '0x47bca1ea1c9785d0c030857ab7ba1d9648f45af2';

    const chainId = hasChainId
      ? searchParams.get('chainId')
      : '0xaa36a7';

    const contentId = hasContentId
      ? searchParams.get('contentId')
      : '0x09a0e2ce13ecf38fccd5160ed9cc40d7bd0ade606ab83894697a808ffdaf5852';


    const metaRes = await postData(DH_GRAPH_ENDPOINT, {
      query: `{records(where: { dao: "${daoId?.toLowerCase()}", table: "DUCE" }, orderBy: createdAt, orderDirection: desc) {id content dao { name } }}`,
    });

    const duce = metaRes.data.records.find((record: any) => {
      const parsedContent = JSON.parse(record.content);
      if (parsedContent?.id && parsedContent.id.toLowerCase() === contentId?.toLowerCase()) {
        return true
      }
    });

    console.log(duce);
    const content = JSON.parse(duce.content);
    // get first image
    const firstImage = content.content.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g)[0];

    console.log(firstImage);

    return new ImageResponse(
      (

        <div
          style={{
            display: 'flex',
            fontSize: 40,
            color: '#f6f6f6',
            background: 'rgb(15 23 42)',
            width: '100%',
            height: '100%',
            paddingTop: 20,
            paddingLeft: 30,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >

          <img
            width="86"
            height="86"
            src={`${firstImage}`}
            style={{
              borderRadius: 128,
            }}
          />
          <p>{`💭 ${duce.dao.name}`}</p>
          <h2>{`${content.title}`}</h2>
          {/* first 100 characters of content */}
          <p><small>{`${content.content.substring(0, 100)}...`}</small></p>


        </div>

      ),
      {
        width: 1200,
        height: 630,
      },
    );

  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}