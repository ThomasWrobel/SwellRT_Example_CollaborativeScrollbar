# SwellRT_Example_CollaborativeScrollbar
A very simple example of a SwellRT client

This is a example javascript file that shows how to use SwellRT to have collaborative, realtime synced, javascript objects over a network.
For full details of SwellRT see;

http://swellrt.org/

Requirements;

- A running SwellRT server 
- (which in turn needs a running MongoDB server)

Setup;

1.Download and place both files into SwellRTs war directory.

2.Edit the HTML to replace 192.168.178.1 with your own computers IP on your network.

3.The HTML file should be accessible at  http://[yourIP]:9898/CollaborativeScrollbar.html

You should then be able to access the file from any machine on your network and see the changes reflected across all tabs with it open. 
