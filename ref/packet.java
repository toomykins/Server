// Decompiled by Jad v1.5.8e. Copyright 2001 Pavel Kouznetsov.
// Jad home page: http://www.geocities.com/kpdus/jad.html
// Decompiler options: packimports(3) 
// Source File Name:   packet.java

import java.io.PrintStream;
import java.math.BigInteger;

public final class packet
{

    private packet()
    {
    }

    public packet(byte abyte0[])
    {
        data = abyte0;
        pos = 0;
    }

    public void p1(int i)
    {
        data[pos++] = (byte)i;
    }

    public void p2(int i)
    {
        data[pos++] = (byte)(i >> 8);
        data[pos++] = (byte)i;
    }

    public void ip2(int i)
    {
        data[pos++] = (byte)i;
        data[pos++] = (byte)(i >> 8);
    }

    public void p3(int i)
    {
        data[pos++] = (byte)(i >> 16);
        data[pos++] = (byte)(i >> 8);
        data[pos++] = (byte)i;
    }

    public void p4(int i)
    {
        data[pos++] = (byte)(i >> 24);
        data[pos++] = (byte)(i >> 16);
        data[pos++] = (byte)(i >> 8);
        data[pos++] = (byte)i;
    }

    public void ip4(int i)
    {
        data[pos++] = (byte)i;
        data[pos++] = (byte)(i >> 8);
        data[pos++] = (byte)(i >> 16);
        data[pos++] = (byte)(i >> 24);
    }

    public void p8(long l)
    {
        data[pos++] = (byte)(int)(l >> 56);
        data[pos++] = (byte)(int)(l >> 48);
        data[pos++] = (byte)(int)(l >> 40);
        data[pos++] = (byte)(int)(l >> 32);
        data[pos++] = (byte)(int)(l >> 24);
        data[pos++] = (byte)(int)(l >> 16);
        data[pos++] = (byte)(int)(l >> 8);
        data[pos++] = (byte)(int)l;
    }

    public void pjstr(String s)
    {
        s.getBytes(0, s.length(), data, pos);
        pos += s.length();
        data[pos++] = 0;
    }

    public void pdata(byte abyte0[], int i, int j)
    {
        for(int k = i; k < i + j; k++)
            data[pos++] = abyte0[k];

    }

    public void pad(int i)
    {
        while(pos < i) 
            data[pos++] = 0;
    }

    public void moveupdata(int i)
    {
        if(i >= pos)
        {
            pos = 0;
            return;
        }
        for(int j = i; j < pos; j++)
            data[j - i] = data[j];

        pos -= i;
    }

    public void psize4(int i)
    {
        data[pos - i - 4] = (byte)(i >> 24);
        data[pos - i - 3] = (byte)(i >> 16);
        data[pos - i - 2] = (byte)(i >> 8);
        data[pos - i - 1] = (byte)i;
    }

    public void psize2(int i)
    {
        data[pos - i - 2] = (byte)(i >> 8);
        data[pos - i - 1] = (byte)i;
    }

    public void psize1(int i)
    {
        data[pos - i - 1] = (byte)i;
    }

    public void psmart(int i)
    {
        if(i < 64 && i >= -64)
        {
            p1(i + 64);
            return;
        }
        if(i < 16384 && i >= -16384)
        {
            p2(i + 49152);
            return;
        } else
        {
            System.out.println("<font color=red>Error psmart out of range: " + i + "</font>");
            return;
        }
    }

    public void psmarts(int i)
    {
        if(i < 128)
        {
            p1(i);
            return;
        }
        if(i < 32768)
        {
            p2(32768 + i);
            return;
        } else
        {
            System.out.println("<font color=red>Error psmarts out of range: " + i + "</font>");
            return;
        }
    }

    public void pstrraw(String s)
    {
        p4(s.length());
        s.getBytes(0, s.length(), data, pos);
        pos += s.length();
    }

    public int g1()
    {
        return data[pos++] & 0xff;
    }

    public byte g1b()
    {
        return data[pos++];
    }

    public int g2()
    {
        pos += 2;
        return ((data[pos - 2] & 0xff) << 8) + (data[pos - 1] & 0xff);
    }

    public int g2b()
    {
        pos += 2;
        int i = ((data[pos - 2] & 0xff) << 8) + (data[pos - 1] & 0xff);
        if(i > 32767)
            i -= 0x10000;
        return i;
    }

    public int g3()
    {
        pos += 3;
        return ((data[pos - 3] & 0xff) << 16) + ((data[pos - 2] & 0xff) << 8) + (data[pos - 1] & 0xff);
    }

    public int g4()
    {
        pos += 4;
        return ((data[pos - 4] & 0xff) << 24) + ((data[pos - 3] & 0xff) << 16) + ((data[pos - 2] & 0xff) << 8) + (data[pos - 1] & 0xff);
    }

    public long g8()
    {
        long l = (long)g4() & 0xffffffffL;
        long l1 = (long)g4() & 0xffffffffL;
        return (l << 32) + l1;
    }

    public String fastgstr()
    {
        if(data[pos] == 10)
        {
            pos++;
            return null;
        } else
        {
            return gstr();
        }
    }

    public String gstr()
    {
        int i = pos;
        while(data[pos++] != 10) ;
        return new String(data, i, pos - i - 1);
    }

    public byte[] gstrbyte()
    {
        int i = pos;
        while(data[pos++] != 10) ;
        byte abyte0[] = new byte[pos - i - 1];
        for(int j = i; j < pos - 1; j++)
            abyte0[j - i] = data[j];

        return abyte0;
    }

    public void gdata(byte abyte0[], int i, int j)
    {
        for(int k = i; k < i + j; k++)
            abyte0[k] = data[pos++];

    }

    public int gsmart()
    {
        int i = data[pos] & 0xff;
        if(i < 128)
            return g1() - 64;
        else
            return g2() - 49152;
    }

    public int gsmarts()
    {
        int i = data[pos] & 0xff;
        if(i < 128)
            return g1();
        else
            return g2() - 32768;
    }

    public String gstrraw()
    {
        int i = g4();
        int j = pos;
        pos += i;
        return new String(data, j, i);
    }

    public void tinyenc(int ai[])
    {
        int i = pos / 8;
        pos = 0;
        for(int j = 0; j < i; j++)
        {
            int k = g4();
            int l = g4();
            int i1 = 0;
            int j1 = 0x9e3779b9;
            for(int k1 = 32; k1-- > 0;)
            {
                k += (l << 4 ^ l >>> 5) + l ^ i1 + ai[i1 & 3];
                i1 += j1;
                l += (k << 4 ^ k >>> 5) + k ^ i1 + ai[i1 >>> 11 & 3];
            }

            pos -= 8;
            p4(k);
            p4(l);
        }

    }

    public void tinydec(int ai[])
    {
        int i = pos / 8;
        pos = 0;
        for(int j = 0; j < i; j++)
        {
            int k = g4();
            int l = g4();
            int i1 = 0xc6ef3720;
            int j1 = 0x9e3779b9;
            for(int k1 = 32; k1-- > 0;)
            {
                l -= (k << 4 ^ k >>> 5) + k ^ i1 + ai[i1 >>> 11 & 3];
                i1 -= j1;
                k -= (l << 4 ^ l >>> 5) + l ^ i1 + ai[i1 & 3];
            }

            pos -= 8;
            p4(k);
            p4(l);
        }

    }

    public void rsaenc(BigInteger biginteger, BigInteger biginteger1)
    {
        int i = pos;
        pos = 0;
        byte abyte0[] = new byte[i];
        gdata(abyte0, 0, i);
        BigInteger biginteger2 = new BigInteger(abyte0);
        BigInteger biginteger3 = biginteger2.modPow(biginteger, biginteger1);
        byte abyte1[] = biginteger3.toByteArray();
        pos = 0;
        p1(abyte1.length);
        pdata(abyte1, 0, abyte1.length);
    }

    public void rsadec(BigInteger biginteger, BigInteger biginteger1)
    {
        int i = g1();
        byte abyte0[] = new byte[i];
        gdata(abyte0, 0, i);
        BigInteger biginteger2 = new BigInteger(abyte0);
        BigInteger biginteger3 = biginteger2.modPow(biginteger, biginteger1);
        byte abyte1[] = biginteger3.toByteArray();
        pos = 0;
        pdata(abyte1, 0, abyte1.length);
    }

    public int addcrc()
    {
        int i = -1;
        for(int j = 0; j < pos; j++)
            i = i >>> 8 ^ crctable[(i ^ data[j]) & 0xff];

        i = ~i;
        p4(i);
        return i;
    }

    public String g64encoded(int i)
    {
        String s = "";
        int j = i;
        int k = i % 3;
        if(k != 0)
            i += 3 - k;
        for(int l = 0; l < i; l += 3)
        {
            s = s + base64enctab[data[l + pos] >> 2 & 0x3f];
            if(l + 3 > j)
            {
                if(k == 1)
                {
                    s = s + base64enctab[data[l + pos] << 4 & 0x30];
                    s = s + "==";
                } else
                if(k == 2)
                {
                    s = s + base64enctab[data[l + pos] << 4 & 0x30 | data[l + 1 + pos] >> 4 & 0xf];
                    s = s + base64enctab[data[l + 1 + pos] << 2 & 0x3c];
                    s = s + "=";
                }
            } else
            {
                s = s + base64enctab[data[l + pos] << 4 & 0x30 | data[l + 1 + pos] >> 4 & 0xf];
                s = s + base64enctab[data[l + 1 + pos] << 2 & 0x3c | data[l + 2 + pos] >> 6 & 3];
                s = s + base64enctab[data[l + 2 + pos] & 0x3f];
            }
        }

        return s;
    }

    public byte data[];
    public int pos;
    private static int crctable[];
    private static final int CRC32_POLYNOMIAL = 0xedb88320;
    private char base64enctab[] = {
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 
        'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 
        'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 
        'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 
        'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 
        'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', 
        '8', '9', '+', '/'
    };

    static 
    {
        crctable = new int[256];
        for(int j = 0; j < 256; j++)
        {
            int i = j;
            for(int k = 0; k < 8; k++)
                if((i & 1) == 1)
                    i = i >>> 1 ^ 0xedb88320;
                else
                    i >>>= 1;

            crctable[j] = i;
        }

    }
}
