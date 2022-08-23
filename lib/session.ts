import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import nookies from 'nookies'

const CookieKeys = {
  AccessToken: 'nid',
  RefreshToken: 'nidRf',
  UserAttributes: '_user_attributes'
}

interface UserType {
  name: string
}

const getUser = (): UserType => {
  const user = { name: 'Luis Tupa' }

  return user
}

interface AuthTokensType {
  accessToken: string
  refreshToken: string
}

export const getAuthTokens = async (context: GetServerSidePropsContext): Promise<AuthTokensType> => {
  const { req } = context
  let accessToken = req.cookies[CookieKeys.AccessToken]
  let refreshToken = req.cookies[CookieKeys.RefreshToken]

  if (accessToken === undefined || refreshToken === undefined) {
    const authTokens = {
      invitedToken: 'abc',
      refreshToken: 'abc'
    }
    accessToken = authTokens.invitedToken
    refreshToken = authTokens.refreshToken
  }

  return { accessToken, refreshToken }
}

interface GetPropsParams {
  context: GetServerSidePropsContext
  authTokens: AuthTokensType
}

export const withSession = <T>(
  getProps?: (params: GetPropsParams) => Promise<GetServerSidePropsResult<T>>
): GetServerSideProps<T> => {
  const getServerSideProps: GetServerSideProps<T> = async (context) => {
    const authTokens = await getAuthTokens(context)
    nookies.set(context, CookieKeys.AccessToken, authTokens.accessToken, {
      maxAge: 2 * 24 * 60 * 60,
      path: '/'
    })
    nookies.set(context, CookieKeys.RefreshToken, authTokens.refreshToken, {
      maxAge: 2 * 24 * 60 * 60,
      path: '/'
    })
    const user = getUser()
    const result = (getProps !== undefined) ? await getProps({ context, authTokens }) : {}
    const props = ('props' in result) ? (result as any).props : {}

    return {
      ...result,
      props: {
        ...props,
        user
      }
    }
  }

  return getServerSideProps
}
