import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName, amount, customerName, email, phone, size, color, address } = await req.json();

    console.log('Creating payment request for:', { productName, amount, customerName, email, phone, size });

    // Validate required fields
    if (!productName || !amount || !customerName || !email || !phone) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('INSTAMOJO_API_KEY');
    const authToken = Deno.env.get('INSTAMOJO_AUTH_TOKEN');
    const baseUrl = Deno.env.get('INSTAMOJO_BASE_URL') || 'https://www.instamojo.com';

    if (!apiKey || !authToken) {
      console.error('Missing Instamojo credentials');
      return new Response(
        JSON.stringify({ success: false, error: 'Payment gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build description
    const description = `Size: ${size} | Product: ${color} | Address: ${address}`;
    console.log('Payment description:', description);

    // Build form data for Instamojo
    const formData = new URLSearchParams();
    formData.append('purpose', productName);
    formData.append('amount', amount.toString());
    formData.append('buyer_name', customerName);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('send_email', 'False');
    formData.append('send_sms', 'False');
    formData.append('redirect_url', `${req.headers.get('origin') || 'https://the90minutedrip.lovable.app'}/payment-success`);

    console.log('Sending request to Instamojo:', baseUrl);

    const response = await fetch(`${baseUrl}/api/1.1/payment-requests/`, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'X-Auth-Token': authToken,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();
    console.log('Instamojo response:', JSON.stringify(data));

    if (data.success && data.payment_request?.longurl) {
      return new Response(
        JSON.stringify({
          success: true,
          paymentUrl: data.payment_request.longurl,
          paymentRequestId: data.payment_request.id,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error('Instamojo error:', data);
      return new Response(
        JSON.stringify({
          success: false,
          error: data.message || 'Failed to create payment request',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: unknown) {
    console.error('Error creating payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
